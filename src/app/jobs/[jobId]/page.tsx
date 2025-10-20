'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { JobSummaryHeader } from '@/components/JobSummaryHeader';
import { KeyMetricsDashboard } from '@/components/KeyMetricsDashboard';
import { TestConfigDisplay } from '@/components/TestConfigDisplay';
import { JobDetailsDataExplorer } from '@/components/JobDetailsDataExplorer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Hourglass } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the type for a single job based on your backend response
export type Job = {
  id: string;
  userId: string;
  status: string;
  statusMessage: string | null;
  progressPercentage: number | null;
  currentOperation: string | null;
  summary: any; 
  config: any; 
  rawFileUrls: any;
  createdAt: string;
  updatedAt: string;
};

async function fetchJob(jobId: string): Promise<Job> {
  const res = await fetch(`/api/v1/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
}

const InProgressPlaceholder = () => (
    <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg mt-8">
        <Hourglass className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">Test in Progress</h3>
        <p className="text-muted-foreground">The full report will be available here once the job is complete.</p>
    </div>
);

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: job, error, isLoading } = useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
        const job = query.state.data;
        // Stop refetching if the job is completed, failed, or cancelled
        return (job?.status === 'completed' || job?.status === 'failed' || job?.status === 'cancelled') ? false : 5000;
    },
  });

  if (isLoading) {
    return <JobDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load job details: {error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return null; // Or a 'Not Found' component
  }

  const isRunning = job.status === 'queued' || job.status === 'running';

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <JobSummaryHeader job={job} />
      {isRunning ? (
        <InProgressPlaceholder />
      ) : (
        <>
            <KeyMetricsDashboard summary={job.summary} />
            <TestConfigDisplay config={job.config} />
            <JobDetailsDataExplorer job={job} />
        </>
      )}
    </div>
  );
}

function JobDetailsSkeleton() {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        {/* Key Metrics Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
        {/* Config Skeleton */}
        <Skeleton className="h-48 w-full" />
        {/* Tabs Skeleton */}
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }