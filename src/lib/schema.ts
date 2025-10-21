import { z } from "zod";

// Define a detailed, type-safe schema for the 'config' object
export const configSchema = z.object({
  spec_file_content: z.string(), // Renamed from 'spec' for clarity and consistency
  api_url_override: z.string().optional(),
  llm_engine: z.string().optional(),
  llm_engine_temperature: z.number().optional(),
  use_cached_graph: z.boolean().optional(),
  use_cached_q_tables: z.boolean().optional(),
  rl_agent_learning_rate: z.number().optional(),
  rl_agent_discount_factor: z.number().optional(),
  rl_agent_max_exploration: z.number().optional(),
  time_duration_seconds: z.number().optional(),
  mutation_rate: z.number().optional(),
});

// The main payload schema now uses the detailed configSchema
export const payloadSchema = z.object({
  jobId: z.string(),
  config: configSchema,
});

// Schema for validating the CI setup request
export const ciSetupSchema = configSchema.extend({
    repository: z.string().min(1, "Repository name is required."),
    specPath: z.string().min(1, "Spec file path is required."),
    apiKeyName: z.string().min(1, "API Key Secret Name is required."),
});

// Define the Zod schema for progress updates. All fields are optional.
export const progressUpdateSchema = z.object({
  progressPercentage: z.number().optional(),
  currentOperation: z.string().optional(),
  statusMessage: z.string().optional(),
});

export type TProgressUpdateSchema = z.infer<typeof progressUpdateSchema>;
