"use client";

import { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Base oklch color values (L C H) from globals.css for light theme
const BASE_OKLCH_COLORS: Record<string, string> = {
  "2": "0.6 0.118 184.704", // --chart-2 (Green/Teal)
  "4": "0.828 0.189 84.429", // --chart-4 (Yellow)
  "5": "0.577 0.245 27.325", // --destructive (Red)
  default: "0.646 0.222 41.116", // --chart-1 (Orange)
};

// Generates a shade by adjusting the lightness of a base oklch color
function generateShade(baseLCH: string, index: number, totalInGroup: number) {
  const [l, c, h] = baseLCH.split(" ").map(parseFloat);
  // Use a larger total range for more distinct steps
  const totalLightnessRange = 0.3;
  const step = totalInGroup > 1 ? totalLightnessRange / (totalInGroup - 1) : 0;
  // Center the modifications around the base lightness
  const modification = step * (index - (totalInGroup - 1) / 2);
  const newL = Math.max(0.1, Math.min(0.95, l - modification)); // Clamp to avoid pure white/black
  return `oklch(${newL.toFixed(3)} ${c} ${h})`;
}

export function StatusCodePieChart({ data }: { data: Record<string, number> }) {
  const chartData = useMemo(
    () =>
      Object.entries(data).map(([status, value]) => ({
        name: `Status ${status}`,
        status: status,
        value,
      })),
    [data],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Requests",
      },
    };

    const groups: Record<string, { status: string; name: string }[]> = {};

    // Group data by status code range
    chartData.forEach((item) => {
      const groupKey = item.status.charAt(0);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Generate shades for each group
    Object.values(groups).forEach((group) => {
      const baseColorKey =
        group[0].status.charAt(0) in BASE_OKLCH_COLORS
          ? group[0].status.charAt(0)
          : "default";
      const baseLCH = BASE_OKLCH_COLORS[baseColorKey];
      group.forEach((item, index) => {
        config[item.name] = {
          label: item.name,
          color: generateShade(baseLCH, index, group.length),
        };
      });
    });

    return config;
  }, [chartData]);

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.status}`}
                fill={chartConfig[entry.name]?.color}
              />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
