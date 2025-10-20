'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/app/jobs/[jobId]/page';
import { StatusCodePieChart } from './StatusCodePieChart';
import { ServerErrorBarChart } from './ServerErrorBarChart';
import { RawDataDownloads } from './RawDataDownloads';

export function JobDetailsTabs({ job }: { job: Job }) {
  return (
    <Tabs defaultValue="status_codes" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="status_codes">Status Code Distribution</TabsTrigger>
        <TabsTrigger value="server_errors">Operations with Server Errors</TabsTrigger>
        <TabsTrigger value="downloads">Downloads</TabsTrigger>
      </TabsList>
      <TabsContent value="status_codes">
        <Card>
          <CardHeader>
            <CardTitle>Status Code Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <StatusCodePieChart data={job.summary?.status_code_distribution} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="server_errors">
        <Card>
          <CardHeader>
            <CardTitle>Operations with Server Errors</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <ServerErrorBarChart data={job.summary?.operations_with_server_errors} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="downloads">
        <Card>
          <CardHeader>
            <CardTitle>Raw Data Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <RawDataDownloads urls={job.rawFileUrls} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}