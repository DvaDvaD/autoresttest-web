"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ServerErrorBarChartProps {
  data:
    | Record<
        string,
        {
          parameters: Record<string, unknown> | null;
          body: Record<string, unknown> | null;
        }[]
      >
    | null
    | undefined;
}

export function ServerErrorBarChart({ data }: ServerErrorBarChartProps) {
  if (!data || Object.keys(data).length === 0)
    return (
      <div className="text-center text-muted-foreground">
        No server errors recorded
      </div>
    );

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    errors: value,
  }));

  return (
    <ChartContainer config={{}} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="errors" fill="#FF8042" radius={5} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
