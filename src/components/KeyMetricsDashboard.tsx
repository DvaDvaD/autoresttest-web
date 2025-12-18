"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TJobSummary } from "@/lib/schema";
import {
  Activity,
  Timer,
  AlertTriangle,
  Fingerprint,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function KeyMetricsDashboard({
  summary,
}: {
  summary: TJobSummary | null;
}) {
  const serverErrorOpsCount = Object.keys(
    summary?.operations_with_server_errors || {},
  ).length;

  const totalOps = summary?.number_of_total_operations || 1; // Prevent division by zero
  const brokenPercentage = ((serverErrorOpsCount / totalOps) * 100).toFixed(1) + "%";

  const metrics = [
    {
      title: "Total Requests",
      value: summary?.total_requests_sent?.toLocaleString(),
      icon: Activity,
      description:
        "The cumulative number of HTTP requests sent by the agent to explore your API's surface area.",
    },
    {
      title: "Test Duration",
      value: summary?.duration ? `${summary.duration}` : undefined,
      icon: Timer,
      description: "The total time elapsed during the test execution.",
    },
    {
      title: "Broken Endpoints",
      value: `${serverErrorOpsCount} / ${summary?.number_of_total_operations} (${brokenPercentage})`,
      icon: AlertTriangle,
      className: serverErrorOpsCount > 0 ? "text-destructive" : undefined,
      cardClassName:
        serverErrorOpsCount > 0
          ? "border-destructive/50 bg-destructive/10"
          : undefined,
      description:
        "The number of unique API operations that returned a server error (5xx status code) at least once.",
    },
    {
      title: "Failing Scenarios",
      value: summary?.number_of_unique_server_errors,
      icon: Fingerprint,
      description:
        "The number of unique combinations of request parameters and body content that triggered a server error.",
    },
    {
      title: "Working Endpoints",
      value: `${summary?.number_of_successfully_processed_operations} / ${summary?.number_of_total_operations} (${summary?.percentage_of_successfully_processed_operations})`,
      icon: CheckCircle2,
      className:
        summary?.number_of_successfully_processed_operations ===
        summary?.number_of_total_operations
          ? "text-green-600"
          : undefined,
      cardClassName:
        summary?.number_of_successfully_processed_operations ===
        summary?.number_of_total_operations
          ? "border-green-500/50 bg-green-500/10"
          : undefined,
      description:
        "The number of operations that were successfully called (returned a valid 2xx/4xx response) versus the total number of operations in the spec.",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <Card key={index} className={metric.cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{metric.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <metric.icon
                className={`h-4 w-4 text-muted-foreground ${metric.className}`}
              />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.className}`}>
                {metric.value ?? "N/A"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
