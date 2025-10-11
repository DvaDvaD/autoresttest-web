import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JobDetailsSkeletonProps {
  jobId: string;
}

export function JobDetailSkeleton({ jobId }: JobDetailsSkeletonProps) {
  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Job Details</p>
        <h1 className="text-3xl font-bold font-mono">{jobId}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-bold">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-bold">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-bold">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-bold">Unique Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border rounded-md mb-6">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">
            Status Code Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <Card className="border-border rounded-md">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">Raw Data</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-wrap gap-4">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-52" />
        </CardContent>
      </Card>
    </>
  );
}
