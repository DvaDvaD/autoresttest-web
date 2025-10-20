"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobs, cancelJob, Job } from "@/lib/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { JobHistorySkeleton } from "@/components/JobHistorySkeleton";
import { Badge } from "./ui/badge";

const columnHelper = createColumnHelper<Job>();

const StatusBadge = ({ status }: { status: string }) => {
  const variant: "default" | "destructive" | "outline" =
    status === "completed"
      ? "default"
      : status === "failed" || status === "cancelled"
        ? "destructive"
        : "outline";
  return <Badge variant={variant}>{status}</Badge>;
};
export function JobHistory() {
  const queryClient = useQueryClient();
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data?.some((job) => job.status === "queued" || job.status === "running")
      ) {
        return 2000;
      }
      return false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelJob, // Use the imported function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "Job ID",
      cell: (info) => (
        <span className="font-mono">{info.getValue().substring(0, 12)}...</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="space-x-2 text-right">
            <Button
              asChild
              size="sm"
              disabled={job.status !== "completed" && job.status !== "failed"}
            >
              <Link href={`/jobs/${job.id}`}>Details</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelMutation.mutate(job.id)}
              disabled={job.status !== "queued" && job.status !== "running"}
            >
              Cancel
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: jobs ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <JobHistorySkeleton />;

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No jobs found. Start a new test to see your history.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
