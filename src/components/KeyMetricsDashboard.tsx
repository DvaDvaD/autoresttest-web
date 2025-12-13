'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TJobSummary } from '@/lib/schema';

export function KeyMetricsDashboard({ summary }: { summary: TJobSummary | null }) {
  const metrics = [
    { title: 'Total Requests', value: summary?.total_requests_sent },
    { title: 'Test Duration', value: summary?.duration },
    { title: 'Ops with Server Errors', value: Object.keys(summary?.operations_with_server_errors || {}).length },
    { title: 'Unique Server Errors', value: summary?.number_of_unique_server_errors },
    { title: 'Successful Ops', value: `${summary?.number_of_successfully_processed_operations} / ${summary?.number_of_total_operations} (${summary?.percentage_of_successfully_processed_operations})` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value ?? 'N/A'}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
