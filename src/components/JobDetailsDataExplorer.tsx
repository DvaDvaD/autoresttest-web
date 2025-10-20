'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/app/jobs/[jobId]/page';
import { OperationStatusCodesChart } from './details/OperationStatusCodesChart';
import { ServerErrorsViewer } from './details/ServerErrorsViewer';
import { SuccessfulRequestsViewer } from './details/SuccessfulRequestsViewer';
import { QTablesExplorer } from './details/QTablesExplorer';

export function JobDetailsDataExplorer({ job }: { job: Job }) {
  const rawFileUrls = job.rawFileUrls || {};

  return (
    <div>
        <h2 className="text-2xl font-bold tracking-tight my-6">Detailed Data Explorer</h2>
        <Tabs defaultValue="op_status_codes" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="op_status_codes">Operation Statuses</TabsTrigger>
                <TabsTrigger value="server_errors">Server Errors</TabsTrigger>
                <TabsTrigger value="successful_requests">Successful Requests</TabsTrigger>
                <TabsTrigger value="q_tables">Q-Tables</TabsTrigger>
            </TabsList>

            <TabsContent value="op_status_codes">
                <Card>
                <CardHeader>
                    <CardTitle>Status Codes per Operation</CardTitle>
                </CardHeader>
                <CardContent>
                    <OperationStatusCodesChart url={rawFileUrls.operation_status_codes} />
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="server_errors">
                <Card>
                <CardHeader>
                    <CardTitle>Server Error Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ServerErrorsViewer url={rawFileUrls.server_errors} />
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="successful_requests">
                <Card>
                <CardHeader>
                    <CardTitle>Successful Requests Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                    <SuccessfulRequestsViewer urls={rawFileUrls} />
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="q_tables">
                <Card>
                <CardHeader>
                    <CardTitle>Q-Tables Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                    <QTablesExplorer url={rawFileUrls.q_tables} />
                </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
