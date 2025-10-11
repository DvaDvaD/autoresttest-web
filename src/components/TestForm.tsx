"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

const createJob = async (data: any) => {
  const response = await fetch("/api/v1/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create job");
  }

  return response.json();
};

export function TestForm() {
  const [scanType, setScanType] = useState("quick");
  const [testType, setTestType] = useState("one-time");
  const [spec, setSpec] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [llmEngine, setLlmEngine] = useState("gpt-4");
  const [temperature, setTemperature] = useState([0.7]);
  const [useCachedGraph, setUseCachedGraph] = useState(false);
  const [useCachedQTables, setUseCachedQTables] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({ 
    mutationFn: createJob, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });

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
    <Card>
      <CardHeader>
        <CardTitle>New Test Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Scan Type</Label>
            <RadioGroup value={scanType} onValueChange={setScanType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick" />
                <Label htmlFor="quick">Quick Scan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deep" id="deep" />
                <Label htmlFor="deep">Deep Scan</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Test Type</Label>
            <RadioGroup value={testType} onValueChange={setTestType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time">One Time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ci" id="ci" />
                <Label htmlFor="ci">Integrate to GitHub CI</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spec">Specification (OpenAPI)</Label>
            <Textarea id="spec" value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="Paste your OpenAPI spec here" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL Override</Label>
            <Input id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.example.com" />
          </div>

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
              <span className="text-sm text-muted-foreground">{temperature[0]}</span>
            </div>
            <Slider value={temperature} onValueChange={setTemperature} max={1} step={0.1} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="cachedGraph" checked={useCachedGraph} onCheckedChange={(checked) => setUseCachedGraph(!!checked)} />
            <Label htmlFor="cachedGraph">Use Cached Graph</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="cachedQTables" checked={useCachedQTables} onCheckedChange={(checked) => setUseCachedQTables(!!checked)} />
            <Label htmlFor="cachedQTables">Use Cached Q-Tables</Label>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating Job..." : "Create Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
