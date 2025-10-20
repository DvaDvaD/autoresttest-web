"use client";

import { Badge } from "@/components/ui/badge";
import { Job } from "@/app/jobs/[jobId]/page";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export function JobSummaryHeader({ job }: { job: Job }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "running":
      case "queued":
        return "secondary";
      default:
        return "default";
    }
  };

  const isRunning = job.status === "queued" || job.status === "running";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {job.summary?.title || `Job: ${job.id}`}
        </h1>
        <Badge
          variant={getStatusVariant(job.status)}
          className="capitalize text-base"
        >
          {isRunning && (
            <span className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse"></span>
          )}
          {job.status}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        <span>Created: {format(new Date(job.createdAt), "PPP p")}</span>
        <span className="mx-2">|</span>
        <span>Last Updated: {format(new Date(job.updatedAt), "PPP p")}</span>
      </div>

      {isRunning && (
        <div className="pt-2 space-y-2">
          <Progress
            value={job.progressPercentage || 0}
            className="w-full md:w-1/2"
          />
          <p className="text-sm text-muted-foreground">
            {job.statusMessage || job.currentOperation || "Initializing..."}
          </p>
        </div>
      )}
    </div>
  );
}

