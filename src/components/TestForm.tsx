"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Dropzone,
  DropzoneEmptyState,
  DropzoneContent,
} from "@/components/ui/shadcn-io/dropzone";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/ui/shadcn-io/code-block";

import { createJob } from "@/lib/api";

export function TestForm() {
  const [scanType, setScanType] = useState("quick");
  const [testType, setTestType] = useState("one-time");
  const [spec, setSpec] = useState("");
  const [specFile, setSpecFile] = useState<File[] | undefined>();
  const [specLanguage, setSpecLanguage] = useState("yaml");
  const [apiUrl, setApiUrl] = useState("");
  const [llmEngine, setLlmEngine] = useState("gpt-4");
  const [temperature, setTemperature] = useState([0.7]);
  const [useCachedGraph, setUseCachedGraph] = useState(false);
  const [useCachedQTables, setUseCachedQTables] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSpecFile(acceptedFiles);

      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "json") {
        setSpecLanguage("json");
      } else {
        setSpecLanguage("yaml");
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSpec(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      api_url_override: apiUrl,
      llm_engine: llmEngine,
      llm_engine_temperature: temperature[0],
      use_cached_graph: useCachedGraph,
      use_cached_q_tables: useCachedQTables,
    };
    mutation.mutate({ spec, config });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Options</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the type and scope of your test.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Scan Type</Label>
            <RadioGroup
              value={scanType}
              onValueChange={setScanType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick" />
                <Label htmlFor="quick">Quick</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deep" id="deep" />
                <Label htmlFor="deep">Deep</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Test Type</Label>
            <RadioGroup
              value={testType}
              onValueChange={setTestType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time">One Time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ci" id="ci" disabled />
                <Label htmlFor="ci">GitHub CI (soon)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Core Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spec">OpenAPI Specification</Label>
            <div className="flex flex-col gap-2">
              <Dropzone
                onDrop={handleFileDrop}
                src={specFile}
                accept={{
                  "application/json": [".json"],
                }}
                className="flex-1"
              >
                {specFile ? <DropzoneContent /> : <DropzoneEmptyState />}
              </Dropzone>
              {spec && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Spec</Button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col sm:max-w-[80vw] max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{specFile?.[0].name ?? "spec"}</DialogTitle>
                    </DialogHeader>
                    <CodeBlock
                      className="flex-grow overflow-y-auto"
                      value={specLanguage}
                      data={[
                        {
                          language: specLanguage,
                          code: spec,
                          filename: specFile?.[0].name ?? "spec",
                        },
                      ]}
                    >
                      <CodeBlockBody>
                        {(item) => (
                          <CodeBlockItem
                            key={item.filename}
                            value={item.language}
                          >
                            <CodeBlockContent>{item.code}</CodeBlockContent>
                          </CodeBlockItem>
                        )}
                      </CodeBlockBody>
                    </CodeBlock>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL Override (Optional)</Label>
            <Input
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="llmEngine">LLM Engine</Label>
            <Select value={llmEngine} onValueChange={setLlmEngine}>
              <SelectTrigger id="llmEngine">
                <SelectValue placeholder="Select LLM Engine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-2">Claude 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>LLM Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {temperature[0]}
              </span>
            </div>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={1}
              step={0.1}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cachedGraph"
              checked={useCachedGraph}
              onCheckedChange={(checked) => setUseCachedGraph(!!checked)}
            />
            <Label htmlFor="cachedGraph">Use Cached Graph</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cachedQTables"
              checked={useCachedQTables}
              onCheckedChange={(checked) => setUseCachedQTables(!!checked)}
            />
            <Label htmlFor="cachedQTables">Use Cached Q-Tables</Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Creating Job..." : "Create Job"}
      </Button>
    </form>
  );
}
