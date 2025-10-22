"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Terminal } from "lucide-react";
import ReactJson from "react-json-view";

import { fetchRawData } from "@/lib/api";

export function GroupedDataViewer({
  url,
  dataKey,
}: {
  url: string;
  dataKey: string;
}) {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error } = useQuery<Record<string, any>>({
    queryKey: [dataKey, url],
    queryFn: () => fetchRawData(url),
    enabled: enabled && !!url,
  });

  if (!url) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        No data available for this category.
      </p>
    );
  }

  if (!enabled) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            View detailed successful {dataKey.toLowerCase()}.
          </p>
          <Button onClick={() => setEnabled(true)}>Load {dataKey}</Button>
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
          Failed to load {dataKey}: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          No successful {dataKey.toLowerCase()} were recorded for this test run.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {Object.entries(data).map(([operationId, details]) => (
        <AccordionItem
          key={operationId}
          value={operationId}
          className="border rounded-lg"
        >
          <AccordionTrigger className="px-4 py-2 text-base font-medium hover:no-underline">
            {operationId}
          </AccordionTrigger>
          <AccordionContent className="p-2 border-t">
            <div className="p-2 bg-muted rounded-lg max-h-[400px] overflow-auto">
              <ReactJson
                src={details}
                theme="monokai"
                collapsed={1}
                name={false}
                displayDataTypes={false}
                enableClipboard={(copy) => {
                  // This function runs immediately when user clicks "copy"
                  const text =
                    typeof copy === "string"
                      ? copy
                      : JSON.stringify(copy, null, 2);
                  navigator.clipboard.writeText(text).catch(console.error);
                }}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
