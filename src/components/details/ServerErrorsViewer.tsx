"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";

const ReactJson = dynamic(() => import("react-json-view"));

import { fetchRawData } from "@/lib/api";
import { TGroupedErrors } from "@/lib/schema";
import dynamic from "next/dynamic";

export function ServerErrorsViewer({
  url,
}: {
  url: string | null | undefined;
}) {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error } = useQuery<TGroupedErrors>({
    queryKey: ["serverErrorsGrouped", url],
    queryFn: () => fetchRawData(url!),
    enabled: enabled && !!url,
  });

  if (!enabled) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            View detailed server error logs grouped by operation.
          </p>
          <Button onClick={() => setEnabled(true)}>Load Server Errors</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load server errors: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          No server errors were recorded for this test run.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {Object.entries(data).map(([operationId, errors]) => (
        <AccordionItem
          key={operationId}
          value={operationId}
          className="border rounded-lg"
        >
          <AccordionTrigger className="px-4 py-2 text-base font-medium hover:no-underline">
            <div className="flex items-center gap-4">
              <span>{operationId}</span>
              <Badge variant="destructive">{errors.length} unique errors</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="border-t p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {JSON.stringify(error.parameters)}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {JSON.stringify(error.body)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Full
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {operationId} - Error Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-2 bg-muted p-4 rounded-lg max-h-[60vh] overflow-auto">
                              <ReactJson
                                src={error}
                                theme="monokai"
                                collapsed={2}
                                name={false}
                                displayDataTypes={false}
                                enableClipboard={(copy) => {
                                  // This function runs immediately when user clicks "copy"
                                  const text =
                                    typeof copy === "string"
                                      ? copy
                                      : JSON.stringify(copy, null, 2);
                                  navigator.clipboard
                                    .writeText(text)
                                    .catch(console.error);
                                }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
