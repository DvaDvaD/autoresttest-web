"use client";

import { fetchRawData } from "@/lib/api";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";

// Base oklch color values (L C H) from globals.css for light theme
const BASE_OKLCH_COLORS = {
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

export function OperationStatusCodesChart({ url }: { url: string }) {
  const { data, isLoading, isError, error } = useQuery<
    Record<string, Record<string, number>>
  >({
    queryKey: ["operationStatusCodes", url],
    queryFn: () => fetchRawData(url),
    enabled: !!url,
  });

  const { chartData, chartConfig, allKeys } = useMemo(() => {
    if (!data)
      return { chartData: [], chartConfig: {} as ChartConfig, allKeys: [] };

    const keys = new Set<string>();
    const transformedData = Object.entries(data).map(
      ([operationName, codes]) => {
        Object.keys(codes).forEach((key) => keys.add(key));
        return {
          name: operationName,
          ...codes,
        };
      },
    );

    const allKeys = Array.from(keys).sort();

    const chartConfig: ChartConfig = {};
    const groups: Record<string, string[]> = {};

    // Group keys by their first digit (2xx, 4xx, etc.)
    allKeys.forEach((key) => {
      const group = key.charAt(0);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(key);
    });

    // Generate a unique shade for each key within its group
    Object.values(groups).forEach((group) => {
      const baseColorKey =
        group[0].charAt(0) in BASE_OKLCH_COLORS
          ? group[0].charAt(0)
          : "default";
      const baseLCH = BASE_OKLCH_COLORS[baseColorKey];
      group.forEach((key, index) => {
        chartConfig[key] = {
          label: `Status ${key}`,
          color: generateShade(baseLCH, index, group.length),
        };
      });
    });

    return { chartData: transformedData, chartConfig, allKeys };
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load chart data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" stacked />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {allKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={chartConfig[key]?.color}
              radius={5}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
