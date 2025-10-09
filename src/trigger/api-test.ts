import { schemaTask, tasks, wait } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { payloadSchema } from "@/lib/schema";

export const apiTestRunner = schemaTask({
  id: "api-test-runner",
  schema: payloadSchema,
  run: async (payload, { ctx, signal }) => {
    const { jobId, config } = payload;

    // Retry logic to handle potential DB replication lag
    let job = null;
    for (let i = 0; i < 5; i++) {
      job = await prisma.job.findUnique({ where: { id: jobId } });
      if (job) {
        break;
      }
      // Wait for 1 second before the next attempt
      await wait.for({ seconds: 1 });
    }

    // If the job is still not found after retries, throw an error.
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found after 5 retries.`);
    }

    const fastApiUrl = process.env.FASTAPI_URL;
    const fastApiKey = process.env.FASTAPI_API_KEY;

    if (!fastApiUrl || !fastApiKey) {
      throw new Error("FASTAPI_URL and FASTAPI_API_KEY must be set");
    }

    try {
      // Now we can safely update the job status
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "running" },
      });

      const response = await fetch(`${fastApiUrl}/api/v1/tests/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": fastApiKey,
        },
        body: JSON.stringify({ config, job_id: jobId }),
        signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `FastAPI service returned an error: ${response.status} ${response.statusText}. Body: ${errorBody}`,
        );
      }

      const result = await response.json();

      await prisma.job.update({
        where: { id: jobId },
        data: {
          summary: result.summary,
          rawFileUrls: result.raw_file_urls,
          status: "completed",
        },
      });

      return { success: true, jobId };
    } catch (error) {
      // The job is confirmed to exist, so this update should not fail with a "not found" error.
      // This will only run if the fetch or subsequent update fails.
      // We check if the error is an AbortError, which means the run was cancelled.
      // If so, we don't want to set the status to "failed". The onCancel hook will handle it.
      if (!(error instanceof Error && error.name === "AbortError")) {
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "failed" },
        });
      }
      // Re-throw the error to fail the task run
      throw error;
    }
  },
});

tasks.onCancel(async ({ ctx, payload }) => {
  console.log(`Run ${ctx.run.id} was cancelled.`);

  // A global onCancel can be triggered by any task.
  // We must first check if this is the task we care about.
  if (ctx.task.id !== "api-test-runner") {
    return;
  }

  // Use Zod's .safeParse() to act as a type guard.
  const parsedPayload = payloadSchema.safeParse(payload);

  // Only if the payload successfully matches our schema, we can proceed.
  if (parsedPayload.success) {
    const jobId = parsedPayload.data.jobId;

    // Use updateMany to avoid a "record not found" error if the task is
    // cancelled before the initial job record has replicated.
    await prisma.job.updateMany({
      where: { id: jobId, status: { not: "completed" } },
      data: { status: "cancelled" },
    });

    console.log(`Job ${jobId} status updated to "cancelled".`);
  } else {
    // This can happen if another task is cancelled or if the payload is malformed.
    console.error(
      "Cancellation hook received a payload that did not match the expected schema.",
      parsedPayload.error,
    );
  }
});
