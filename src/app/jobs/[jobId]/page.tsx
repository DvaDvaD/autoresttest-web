'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { JobSummaryHeader } from '@/components/JobSummaryHeader';
import { KeyMetricsDashboard } from '@/components/KeyMetricsDashboard';
import { TestConfigDisplay } from '@/components/TestConfigDisplay';
import { JobDetailsTabs } from '@/components/JobDetailsTabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the type for a single job based on your backend response
export type Job = {
  id: string;
  userId: string;
  status: string;
  statusMessage: string | null;
  progressPercentage: number | null;
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

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: job, error, isLoading } = useQuery<Job, Error>({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId),
    enabled: !!jobId, // Only run the query if the jobId is available
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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <JobSummaryHeader job={job} />
      <KeyMetricsDashboard summary={job.summary} />
      <TestConfigDisplay config={job.config} />
      <JobDetailsTabs job={job} />
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