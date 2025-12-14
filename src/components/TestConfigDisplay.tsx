"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ReactJsonView from "react-json-view";
import {
  BrainCircuit,
  GitCommit,
  Link,
  Database,
  DatabaseZap,
  Timer,
  Thermometer,
  TrendingUp,
  Percent,
  Compass,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import React from "react";
import { TManualTestConfig } from "@/lib/schema";

function formatLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const iconMap: Record<string, typeof Link> = {
  llm_engine: BrainCircuit,
  mutation_rate: GitCommit,
  api_url_override: Link,
  use_cached_graph: Database,
  use_cached_q_tables: DatabaseZap,
  time_duration_seconds: Timer,
  llm_engine_temperature: Thermometer,
  rl_agent_learning_rate: TrendingUp,
  rl_agent_discount_factor: Percent,
  rl_agent_max_exploration: Compass,
};

const JsonViewer = ({ jsonString }: { jsonString: string }) => {
  try {
    const jsonObj = JSON.parse(jsonString);
    return (
      <ReactJsonView
        src={jsonObj}
        theme="monokai"
        iconStyle="circle"
        displayDataTypes={false}
        name={false}
      />
    );
  } catch (error) {
    return <pre>{jsonString}</pre>;
  }
};

const ConfigItem = ({
  itemKey,
  value,
}: {
  itemKey: string;
  value: TManualTestConfig[keyof TManualTestConfig];
}) => {
  const Icon = iconMap[itemKey] || Compass; // Default icon
  const label = formatLabel(itemKey);

  const renderValue = () => {
    if (typeof value === "boolean") {
      return value ? (
        <span className="flex items-center font-medium text-green-600">
          <CheckCircle2 className="mr-2 h-4 w-4" /> True
        </span>
      ) : (
        <span className="flex items-center font-medium text-red-600">
          <XCircle className="mr-2 h-4 w-4" /> False
        </span>
      );
    }
    return <span className="font-semibold">{String(value) || "N/A"}</span>;
  };

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />

      <div className="grow">
        <p className="text-sm text-muted-foreground">{label}</p>

        {renderValue()}
      </div>
    </div>
  );
};

export function TestConfigDisplay({
  config,
}: {
  config: TManualTestConfig | null;
}) {
  if (!config) return null;

  const { spec_file_content, ...otherConfig } = config;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(otherConfig).map(([key, value]) => (
            <ConfigItem key={key} itemKey={key} value={value} />
          ))}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">View Spec File</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-160 flex flex-col">
            <SheetHeader>
              <SheetTitle>API Specification</SheetTitle>
              <SheetDescription>
                The OpenAPI spec file used for this test run.
              </SheetDescription>
            </SheetHeader>
            <div className="grow overflow-y-auto">
              <JsonViewer jsonString={spec_file_content} />
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
