import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobDetailSkeleton() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Job Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Requests</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Duration</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
        </Card>
      </div>
      <Card className="mb-8">
        <CardHeader><CardTitle>Status Code Distribution</CardTitle></CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-48" />
      </div>
    </>
  );
}
