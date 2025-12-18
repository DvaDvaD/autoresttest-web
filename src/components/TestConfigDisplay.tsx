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
import { Separator } from "@/components/ui/separator";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useState } from "react";
import { TManualTestConfig } from "@/lib/schema";
import dynamic from "next/dynamic";

const ReactJsonView = dynamic(() => import("react-json-view"));

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
  let jsonObj;
  try {
    jsonObj = JSON.parse(jsonString);
  } catch (error) {
    jsonObj = undefined;
  }
  if (jsonObj) {
    return (
      <ReactJsonView
        src={jsonObj}
        theme="monokai"
        iconStyle="circle"
        displayDataTypes={false}
        name={false}
      />
    );
  } else {
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
        <span className="flex items-center text-sm font-medium text-green-600">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> True
        </span>
      ) : (
        <span className="flex items-center text-sm font-medium text-red-600">
          <XCircle className="mr-1.5 h-3.5 w-3.5" /> False
        </span>
      );
    }
    return (
      <span className="text-sm font-medium break-all">
        {String(value) || "N/A"}
      </span>
    );
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {renderValue()}
      </div>
    </div>
  );
};

const primaryKeys = ["llm_engine", "time_duration_seconds", "api_url_override"];

const behaviorKeys = ["llm_engine_temperature", "mutation_rate"];

const advancedKeys = [
  "rl_agent_learning_rate",
  "rl_agent_discount_factor",
  "rl_agent_max_exploration",
  "use_cached_graph",
  "use_cached_q_tables",
];

export function TestConfigDisplay({
  config,
}: {
  config: TManualTestConfig | null;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!config) return null;

  const { spec_file_content, ...otherConfig } = config;

  const renderSection = (keys: string[], title?: string) => {
    const items = keys
      .filter((key) => key in otherConfig)
      .map((key) => (
        <ConfigItem
          key={key}
          itemKey={key}
          value={otherConfig[key as keyof typeof otherConfig]}
        />
      ));

    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        {title && (
          <div className="flex items-center gap-4">
            <h4 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </h4>
            <Separator className="grow" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Test Configuration</CardTitle>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              View Spec File
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-2xl flex flex-col">
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Settings */}
        {renderSection(primaryKeys)}

        {/* Behavior Settings */}
        {renderSection(behaviorKeys, "Behavioral Tuning")}

        {/* Advanced Settings */}
        <div className="rounded-lg border bg-muted/30 p-1">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between hover:bg-background"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Advanced RL & Caching
            </span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          {showAdvanced && (
            <div className="mt-2 grid grid-cols-1 gap-3 border-t p-3 sm:grid-cols-2 lg:grid-cols-3">
              {advancedKeys
                .filter((key) => key in otherConfig)
                .map((key) => (
                  <ConfigItem
                    key={key}
                    itemKey={key}
                    value={otherConfig[key as keyof typeof otherConfig]}
                  />
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

