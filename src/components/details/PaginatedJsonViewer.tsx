'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Terminal } from 'lucide-react';

async function fetchData(url: string): Promise<any[]> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
}

export function PaginatedJsonViewer({ url, dataKey }: { url: string, dataKey: string }) {
    const [enabled, setEnabled] = useState(false);

    const { data, isLoading, isError, error } = useQuery<any[]>({
        queryKey: [dataKey, url],
        queryFn: () => fetchData(url),
        enabled: enabled && !!url,
    });

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            id: 'data',
            header: 'Data',
            cell: ({ row }) => (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View JSON</AccordionTrigger>
                        <AccordionContent>
                            <pre className="text-xs bg-muted p-2 rounded-sm">{JSON.stringify(row.original, null, 2)}</pre>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )
        }
    ], []);

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (!url) {
        return (
            <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
                 <p className="text-sm text-muted-foreground">No data available for this category.</p>
            </div>
        );
    }

    const renderTableBody = () => {
        if (!enabled) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-48 text-center">
                        <div className="space-y-2">
                            <p className="text-muted-foreground">View detailed logs for successful {dataKey.toLowerCase()}.</p>
                            <Button onClick={() => setEnabled(true)}>Load Successful {dataKey}</Button>
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        if (isLoading) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-48 text-center">
                        <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length}>
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>Failed to load {dataKey}: {error.message}</AlertDescription>
                        </Alert>
                    </TableCell>
                </TableRow>
            );
        }

        if (table.getRowModel().rows.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-48 text-center">
                        No successful {dataKey.toLowerCase()} were recorded for this test run.
                    </TableCell>
                </TableRow>
            );
        }

        return table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {renderTableBody()}
                    </TableBody>
                </Table>
            </div>
            {enabled && !isLoading && table.getRowModel().rows.length > 0 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                    <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
                </div>
            )}
        </div>
    );
}
