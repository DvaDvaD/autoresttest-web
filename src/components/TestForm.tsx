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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createJob, setupCI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ReactJsonView = dynamic(() => import("react-json-view"));

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

export function TestForm() {
  const router = useRouter();

  const [testType, setTestType] = useState("one-time");
  // State for One-Time Test
  const [spec, setSpec] = useState("");
  const [specFile, setSpecFile] = useState<File[] | undefined>();
  const [specIsTouched, setSpecIsTouched] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  // State for CI Setup
  const [repo, setRepo] = useState("");
  const [specPath, setSpecPath] = useState("swagger.json");
  const [apiKeyName, setApiKeyName] = useState("AUTORESTTEST_API_KEY");
  // Universal Advanced Settings
  const [llmEngine, setLlmEngine] = useState("gpt-4");
  const [temperature, setTemperature] = useState([0.7]);
  const [useCachedGraph, setUseCachedGraph] = useState(true);
  const [useCachedQTables, setUseCachedQTables] = useState(true);
  const [learningRate, setLearningRate] = useState([0.1]);
  const [discountFactor, setDiscountFactor] = useState([0.9]);
  const [maxExploration, setMaxExploration] = useState([1]);
  const [duration, setDuration] = useState(60);
  const [mutationRate, setMutationRate] = useState([0.1]);

  const queryClient = useQueryClient();

  const oneTimeJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: ({ jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job Created!", {
        description: "Your test is now running.",
      });
      router.push(`/jobs/${jobId}`);
    },
    onError: (error) => {
      toast.error("Failed to Create Job", { description: error.message });
    },
  });

  const ciSetupMutation = useMutation({
    mutationFn: setupCI,
    onSuccess: () => {
      toast.success("Workflow Created!", {
        description:
          "The autoresttest.yml workflow has been committed to your repository.",
      });
    },
    onError: (error) => {
      toast.error("Setup Failed", { description: error.message });
    },
  });

  const handleFileDrop = (acceptedFiles: File[]) => {
    setSpecIsTouched(true);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSpecFile(acceptedFiles);
      const reader = new FileReader();
      reader.onload = (e) => setSpec(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sharedConfig = {
      llm_engine: llmEngine,
      llm_engine_temperature: temperature[0],
      use_cached_graph: useCachedGraph,
      use_cached_q_tables: useCachedQTables,
      rl_agent_learning_rate: learningRate[0],
      rl_agent_discount_factor: discountFactor[0],
      rl_agent_max_exploration: maxExploration[0],
      time_duration_seconds: duration,
      mutation_rate: mutationRate[0],
      api_url_override: apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl,
    };

    if (testType === "one-time") {
      setSpecIsTouched(true);
      if (!spec) return;
      const config = {
        ...sharedConfig,
      };
      oneTimeJobMutation.mutate({ spec, config });
    } else if (testType === "ci-setup") {
      if (!repo) {
        toast.error("Validation Error", {
          description: "Repository name is required.",
        });
        return;
      }
      ciSetupMutation.mutate({
        repository: repo,
        specPath,
        apiKeyName,
        ...sharedConfig,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={testType}
            onValueChange={setTestType}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-time" id="one-time" />
              <Label htmlFor="one-time">One-Time Test</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ci-setup" id="ci-setup" />
              <Label htmlFor="ci-setup">GitHub CI Setup</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {testType === "one-time" ? (
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
                  accept={{ "application/json": [".json"] }}
                  className={`flex-1 ${!spec && specIsTouched && "border border-destructive!"}`}
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
                        <DialogTitle>
                          {specFile?.[0].name ?? "spec"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grow overflow-y-auto">
                        <JsonViewer jsonString={spec} />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Upload the OpenAPI (Swagger) specification file for the API you
                want to test in JSON format. If not provided, black box testing
                requests will be made to the URL provided in the API
                specification.
              </p>
              {specIsTouched && !spec && (
                <p className="text-xs text-destructive">
                  Specification file is required.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL Override (Optional)</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com"
              />
              <p className="text-xs text-muted-foreground pt-1">
                Test against a different environment by providing a new base URL
                (e.g., a staging server).
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>CI Configuration</CardTitle>
            <CardDescription>
              Please ensure you are logged in with the GitHub account you wish
              to integrate with. This will create a{" "}
              <code>.github/workflows/autoresttest.yml</code> file in the
              specified repository.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo">Repository Name</Label>
              <Input
                id="repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="owner/repo-name"
              />
              <p className="text-xs text-muted-foreground pt-1">
                Provide the full name of the repository where you want to set up
                the workflow.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specPath">Path to Spec File</Label>
              <Input
                id="specPath"
                value={specPath}
                onChange={(e) => setSpecPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground pt-1">
                The path to the OpenAPI file from the root of your repository.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKeyName">API Key Secret Name</Label>
              <Input
                id="apiKeyName"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground pt-1">
                The name of the GitHub Actions secret that will store your
                AutoRestTest API key.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL Override (Optional)</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com"
              />
              <p className="text-xs text-muted-foreground pt-1">
                Test against a different environment by providing a new base URL
                (e.g., a staging server).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <p className="text-xs text-muted-foreground pt-1">
              The underlying model used for generating test cases.
            </p>
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
            <p className="text-xs text-muted-foreground pt-1">
              Lower values are more deterministic; higher values are more
              creative.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cachedGraph"
                checked={useCachedGraph}
                onCheckedChange={(checked) => setUseCachedGraph(!!checked)}
              />
              <Label htmlFor="cachedGraph">Use Cached Graph</Label>
            </div>
            <p className="text-xs text-muted-foreground pt-1 pl-6">
              Speeds up tests by reusing the previously generated API dependency
              graph.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cachedQTables"
                checked={useCachedQTables}
                onCheckedChange={(checked) => setUseCachedQTables(!!checked)}
              />
              <Label htmlFor="cachedQTables">Use Cached Q-Tables</Label>
            </div>
            <p className="text-xs text-muted-foreground pt-1 pl-6">
              Speeds up tests by reusing the agent&apos;s previously learned
              knowledge.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Test Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            />
            <p className="text-xs text-muted-foreground pt-1">
              The total time allocated for the test run (not including the time
              needed to generate the API graph and Q-tables.)
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>RL Learning Rate</Label>
              <span className="text-sm text-muted-foreground">
                {learningRate[0]}
              </span>
            </div>
            <Slider
              value={learningRate}
              onValueChange={setLearningRate}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground pt-1">
              The rate at which the reinforcement learning agent learns from new
              information.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>RL Discount Factor</Label>
              <span className="text-sm text-muted-foreground">
                {discountFactor[0]}
              </span>
            </div>
            <Slider
              value={discountFactor}
              onValueChange={setDiscountFactor}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground pt-1">
              Determines how much the agent prioritizes future rewards over
              immediate ones.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>RL Max Exploration</Label>
              <span className="text-sm text-muted-foreground">
                {maxExploration[0]}
              </span>
            </div>
            <Slider
              value={maxExploration}
              onValueChange={setMaxExploration}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground pt-1">
              The probability that the agent will explore new actions rather
              than exploit known ones.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Mutation Rate</Label>
              <span className="text-sm text-muted-foreground">
                {mutationRate[0]}
              </span>
            </div>
            <Slider
              value={mutationRate}
              onValueChange={setMutationRate}
              max={1}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground pt-1">
              The probability of random changes being introduced during test
              generation.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={
          testType === "one-time"
            ? oneTimeJobMutation.isPending
            : ciSetupMutation.isPending
        }
        className="w-full"
      >
        {testType === "one-time" ? (
          oneTimeJobMutation.isPending ? (
            "Creating Job..."
          ) : (
            "Create Job"
          )
        ) : (
          <>
            <Loader2
              className={`mr-2 h-4 w-4 ${ciSetupMutation.isPending ? "animate-spin" : "hidden"}`}
            />{" "}
            {ciSetupMutation.isPending
              ? "Setting Up Workflow..."
              : "Setup Workflow"}
          </>
        )}
      </Button>
    </form>
  );
}
