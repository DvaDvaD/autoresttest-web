import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tasks } from "@trigger.dev/sdk/v3";
import type { apiTestRunner } from "@/trigger/api-test";
import { configSchema } from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

// --- GET Handler for Listing Jobs ---
const jobListQuery = Prisma.validator<Prisma.JobFindManyArgs>()({
  select: {
    id: true,
    status: true,
    statusMessage: true,
    createdAt: true,
    summary: true,
  },
  orderBy: { createdAt: "desc" },
});
type JobListJob = Prisma.JobGetPayload<typeof jobListQuery>;

export async function GET(
  request: Request,
): Promise<NextResponse<JobListJob[] | { error: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("Fetching job list for user:", userId);

    const jobs = await prisma.job.findMany({
      ...jobListQuery,
      where: { userId: userId }, // Filter jobs by the authenticated user
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- POST Handler for Creating Jobs ---
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("Creating new job for user:", userId);

    const body = await request.json();
    const { spec, config } = body;

    const validationResult = configSchema.safeParse({
      spec_file_content: spec,
      ...config,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: validationResult.error.flatten() },
        { status: 400 },
      );
    }
    const validatedConfig = validationResult.data;

    const newJob = await prisma.job.create({
      data: {
        status: "queued",
        userId: userId, // Associate job with the authenticated user
      },
    });

    await tasks.trigger<typeof apiTestRunner>(
      "api-test-runner",
      {
        jobId: newJob.id,
        config: validatedConfig,
      },
      {
        tags: [newJob.id],
      },
    );

    return NextResponse.json({ jobId: newJob.id }, { status: 202 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job." },
      { status: 500 },
    );
  }
}

