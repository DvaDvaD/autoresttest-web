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
  user_id: z.string().optional(),
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
  spec_file_content: z.string().optional(), // Optional here as spec might not be provided in CI setup
});

// Define the Zod schema for progress updates. All fields are optional.
export const progressUpdateSchema = z.object({
  progressPercentage: z.number().optional(),
  currentOperation: z.string().optional(),
  statusMessage: z.string().optional(),
});

// Schema for server error details, used in viewers and summaries
export const errorDetailSchema = z.object({
  parameters: z.record(z.string(), z.unknown()).nullable(),
  body: z.record(z.string(), z.unknown()).nullable(),
});

// Schema for errors grouped by operation ID
export const groupedErrorsSchema = z.record(
  z.string(),
  z.array(errorDetailSchema),
);

// Schema for the summary object in the Job type
export const jobSummarySchema = z.object({
  title: z.string().optional().nullable(),
  status_code_distribution: z.any().optional().nullable(),
  total_requests_sent: z.number().optional().nullable(),
  duration: z.string().optional().nullable(),
  operations_with_server_errors: groupedErrorsSchema.optional().nullable(),
  number_of_unique_server_errors: z.number().optional().nullable(),
  number_of_successfully_processed_operations: z.number().optional().nullable(),
  number_of_total_operations: z.number().optional().nullable(),
  percentage_of_successfully_processed_operations: z
    .string()
    .optional()
    .nullable(),
});

// Schema for the raw data file URLs
export const rawFileUrlsSchema = z
  .object({
    operation_status_codes: z.string().optional().nullable(),
    server_errors: z.string().optional().nullable(),
    successful_bodies: z.string().optional().nullable(),
    successful_parameters: z.string().optional().nullable(),
    successful_responses: z.string().optional().nullable(),
    successful_primitives: z.string().optional().nullable(),
    q_tables: z.string().optional().nullable(),
  })
  .catchall(z.string());

// The main schema for a Job
export const jobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.string(),
  statusMessage: z.string().nullable(),
  progressPercentage: z.number().nullable(),
  currentOperation: z.string().nullable(),
  summary: jobSummarySchema.nullable(),
  config: configSchema.nullable(),
  rawFileUrls: rawFileUrlsSchema.nullable(),
  createdAt: z.string(), // Assuming ISO string format
  updatedAt: z.string(), // Assuming ISO string format
});

export type TProgressUpdateSchema = z.infer<typeof progressUpdateSchema>;
export type TManualTestConfig = z.infer<typeof configSchema>;
export type TCITestConfig = z.infer<typeof ciSetupSchema>;

export type TErrorDetail = z.infer<typeof errorDetailSchema>;
export type TGroupedErrors = z.infer<typeof groupedErrorsSchema>;
export type TJobSummary = z.infer<typeof jobSummarySchema>;
export type TRawFileUrls = z.infer<typeof rawFileUrlsSchema>;
export type TJob = z.infer<typeof jobSchema>;
