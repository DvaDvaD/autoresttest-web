import { prisma } from "@/lib/prisma";
import { configSchema } from "@/lib/schema";
import type { apiTestRunner } from "@/trigger/api-test";
import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { spec, config } = body;

    // --- Step 1: Validate the incoming config against the Zod schema ---
    const validationResult = configSchema.safeParse({
      spec_file_content: spec,
      ...config,
    });

    if (!validationResult.success) {
      // If validation fails, return a 400 error with details
      return NextResponse.json(
        {
          error: "Invalid input.",
          details: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Use the validated data from this point forward
    const validatedConfig = validationResult.data;

    // Optional: Add user authentication logic here
    // const userId = ...

    // --- Step 2: Create a job record in the database ---
    const newJob = await prisma.job.create({
      data: {
        status: "queued",
        // userId: userId,
      },
    });

    // --- Step 3: Prepare the payload for the Trigger.dev task ---
    const triggerPayload = {
      jobId: newJob.id,
      config: validatedConfig,
    };

    // --- Step 4: Trigger the task ---
    await tasks.trigger<typeof apiTestRunner>(
      "api-test-runner",
      triggerPayload,
      {
        tags: [newJob.id],
      },
    );

    // --- Step 5: Return the new job ID to the frontend ---
    return NextResponse.json({ jobId: newJob.id }, { status: 202 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        status: true,
        statusMessage: true,
        progressPercentage: true,
        currentOperation: true,
        createdAt: true,
        summary: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching job history:", error);
    return NextResponse.json(
      { error: "Failed to fetch job history." },
      { status: 500 },
    );
  }
}
