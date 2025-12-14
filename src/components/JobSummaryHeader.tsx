"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { replayJob, cancelJob, deleteJob } from "@/lib/api";
import { TJob } from "@/lib/schema";
import { format } from "date-fns";
import { MoreHorizontal, Repeat, XCircle, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export function JobSummaryHeader({ job }: { job: TJob }) {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Job ID copied to clipboard");
    });
  };

  const replayMutation = useMutation({
    mutationFn: replayJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job replay requested successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to replay job: ${error.message}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel job: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success("Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete job: ${error.message}`);
    },
  });

  const isRunning = job.status === "queued" || job.status === "running";

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {job.summary?.title || `Job`}
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
          <div className="flex items-center gap-2 pt-1">
            <span className="font-bold text-muted-foreground">Job ID:</span>
            <span className="text-sm font-mono text-muted-foreground">
              {job.id}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(job.id)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => replayMutation.mutate(job.id)}>
              <Repeat className="mr-2 h-4 w-4" />
              <span>Replay</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => cancelMutation.mutate(job.id)}
              disabled={!isRunning}
              className="text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span>Cancel</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                if (
                  window.confirm("Are you sure you want to delete this job?")
                ) {
                  deleteMutation.mutate(job.id);
                }
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
