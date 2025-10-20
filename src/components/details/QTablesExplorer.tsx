"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Terminal } from "lucide-react";
import ReactJson from "react-json-view";

// --- Helper Functions & Components (as before) ---

function findMinMax(obj: any): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  function traverse(current: any) {
    if (typeof current === "number") {
      if (current < min) min = current;
      if (current > max) max = current;
    } else if (Array.isArray(current)) {
      current.forEach((item) => traverse(item));
    } else if (typeof current === "object" && current !== null) {
      Object.values(current).forEach((value) => traverse(value));
    }
  }
  traverse(obj);
  return [min, max];
}

function getHeatmapColor(value: number, min: number, max: number): string {
  if (min === max) return "oklch(0.8 0.05 240)";
  const ratio = (value - min) / (max - min);
  const hue = ratio < 0.5 ? 10 + ratio * 2 * 75 : 85 + (ratio - 0.5) * 2 * 65;
  const lightness = 0.9 - Math.abs(ratio - 0.5) * 0.2;
  const chroma = 0.15;
  return `oklch(${lightness} ${chroma} ${hue})`;
}

const HeatmapItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div
    style={{ backgroundColor: color }}
    className="p-2 rounded-md border border-black/10"
  >
    <div className="font-mono text-sm truncate" title={label}>
      {label}
    </div>
    <div className="font-bold text-lg text-right">{value.toFixed(4)}</div>
  </div>
);

const ValueAgentTable = ({ data }: { data: [any, number][] }) => {
  const [min, max] = useMemo(() => findMinMax(data.map((d) => d[1])), [data]);
  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(([value, score], i) => (
            <TableRow key={i}>
              <TableCell>
                <ReactJson
                  src={value}
                  theme="monokai"
                  collapsed={true}
                  name={false}
                  displayDataTypes={false}
                />
              </TableCell>
              <TableCell
                className="text-right font-semibold"
                style={{ backgroundColor: getHeatmapColor(score, min, max) }}
              >
                {score.toFixed(4)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const DataNode = ({
  data,
  level,
  min,
  max,
}: {
  data: any;
  level: number;
  min: number;
  max: number;
}) => {
  if (typeof data !== "object" || data === null) {
    return <span className="font-mono text-sm">{String(data)}</span>;
  }
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View {data.length} Values</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Value Agent Data</DialogTitle>
          </DialogHeader>
          <ValueAgentTable data={data} />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Accordion type="multiple" className="w-full space-y-1 pl-2">
      {Object.entries(data).map(([key, value]) => (
        <AccordionItem
          key={key}
          value={key}
          className="border rounded-md bg-background"
        >
          <AccordionTrigger className="px-3 py-1 text-sm hover:no-underline">
            {key}
          </AccordionTrigger>
          <AccordionContent className="p-2 border-t bg-muted/50">
            {typeof value === "number" ? (
              <HeatmapItem
                label="Score"
                value={value}
                color={getHeatmapColor(value, min, max)}
              />
            ) : (
              <DataNode data={value} level={level + 1} min={min} max={max} />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const OperationAgentViewer = ({ data }: { data: Record<string, number> }) => {
  const [min, max] = useMemo(() => findMinMax(data), [data]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {Object.entries(data).map(([key, value]) => (
        <HeatmapItem
          key={key}
          label={key}
          value={value}
          color={getHeatmapColor(value, min, max)}
        />
      ))}
    </div>
  );
};

// --- Main Component ---

async function fetchQTables(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
}

export function QTablesExplorer({ url }: { url: string }) {
  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["qTables", url],
    queryFn: () => fetchQTables(url),
    enabled: !!url,
  });

  const [min, max] = useMemo(
    () => (isLoading || !data ? [0, 0] : findMinMax(data)),
    [data, isLoading],
  );
  const agents = useMemo(() => (data ? Object.keys(data) : []), [data]);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(
    agents[0],
  );

  const renderContent = () => {
    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (isError)
      return (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load Q-Tables: {error.message}
          </AlertDescription>
        </Alert>
      );
    if (!data || agents.length === 0)
      return (
        <p className="text-center text-muted-foreground py-10">
          No Q-Table data available.
        </p>
      );

    const agentData = data[selectedAgent || agents[0]];
    const agentName = selectedAgent || agents[0];

    if (typeof agentData === "string") {
      return (
        <p className="text-muted-foreground p-4 text-center border rounded-md">
          {agentData}
        </p>
      );
    } else if (agentName === "OPERATION AGENT") {
      return <OperationAgentViewer data={agentData} />;
    } else {
      return <DataNode data={agentData} level={0} min={min} max={max} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Select onValueChange={setSelectedAgent} value={selectedAgent}>
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Select an Agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}
