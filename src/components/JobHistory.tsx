"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobs, cancelJob, deleteJob, replayJob } from "@/lib/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { JobHistorySkeleton } from "@/components/JobHistorySkeleton";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  FileText,
  XCircle,
  Trash2,
  Repeat,
  HelpCircle,
} from "lucide-react";
import { TJob } from "@/lib/schema";
import { toast } from "sonner";

const columnHelper = createColumnHelper<TJob>();

const StatusBadge = ({ status }: { status: string }) => {
  const variant: "default" | "destructive" | "outline" | "secondary" =
    status === "completed"
      ? "default"
      : status === "failed" || status === "cancelled"
      ? "destructive"
      : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
};

export function JobHistory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: jobs, isLoading } = useQuery<TJob[]>({
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
    mutationFn: cancelJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job cancelled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to cancel job: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete job: ${error.message}`);
    },
  });

  const replayMutation = useMutation({
    mutationFn: replayJob,
    onSuccess: ({ jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job replay requested successfully");
      router.push(`/jobs/${jobId}`);
    },
    onError: (error) => {
      toast.error(`Failed to replay job: ${error.message}`);
    },
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "Job ID",
      cell: (info) => (
        <Link
          href={`/jobs/${info.getValue()}`}
          className="font-mono hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const job = info.row.original;
        const hasError = job.status === "failed" && job.statusMessage;

        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            {hasError && (
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">{job.statusMessage}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-sm" align="end">
                <DropdownMenuLabel className="font-bold text-base">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={() => router.push(`/jobs/${job.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => replayMutation.mutate(job.id)}
                >
                  <Repeat className="mr-2 h-4 w-4" />
                  <span>Replay</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => cancelMutation.mutate(job.id)}
                  disabled={job.status !== "queued" && job.status !== "running"}
                  className="text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  <span>Cancel</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this job?",
                      )
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
        );
      },
    }),
  ];

  const table = useReactTable({
    data: jobs ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
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
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
