"use client";

import { Badge } from "@/components/ui/badge";
import { Job } from "@/app/jobs/[jobId]/page";
import { format } from "date-fns";

export function JobSummaryHeader({ job }: { job: Job }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {job.summary?.title || "Job Details"}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Badge variant={getStatusVariant(job.status)} className="capitalize">
          {job.status}
        </Badge>
        <span>Job ID: {job.id}</span>
        <span>Created: {format(new Date(job.createdAt), "PPP p")}</span>
        <span>Last Updated: {format(new Date(job.updatedAt), "PPP p")}</span>
      </div>
    </div>
  );
}
