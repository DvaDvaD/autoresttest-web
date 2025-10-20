import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { progressUpdateSchema, TProgressUpdateSchema } from "@/lib/schema";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ job_id: string }> },
) {
  // --- 1. Authentication ---
  const authToken = request.headers.get("Authorization");
  const internalApiKey = process.env.INTERNAL_API_KEY;

  if (!internalApiKey) {
    console.error("INTERNAL_API_KEY is not set.");
    return NextResponse.json(
      { error: "Internal server configuration error." },
      { status: 500 },
    );
  }

  if (authToken !== `Bearer ${internalApiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job_id } = await props.params;

  console.log(`Received progress update for job: ${job_id}`);

  try {
    // --- 2. Payload Validation ---
    const body = await request.json();
    const processedBody: TProgressUpdateSchema = {
      currentOperation: body?.stage,
      progressPercentage: body?.percentage,
      statusMessage: body?.details,
    };
    const validationResult = progressUpdateSchema.safeParse(processedBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body.",
          details: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const validatedData = validationResult.data;

    // --- 3. Database Update ---
    // Use updateMany to conditionally update the job. This prevents a race condition
    // where a late progress update could overwrite a final 'failed' or 'cancelled' status.
    const updateResult = await prisma.job.updateMany({
      where: {
        id: job_id,
        status: {
          notIn: ["failed", "cancelled", "completed"],
        },
      },
      data: {
        ...validatedData,
        status: "running", // Ensure status remains 'running' during progress updates
      },
    });

    if (updateResult.count === 0) {
        console.log(`Job ${job_id} was already in a terminal state. No progress update applied.`);
        // Return a success response but indicate that no change was made.
        return NextResponse.json({ message: "Job is in a terminal state; no update applied." });
    }

    return NextResponse.json({ message: "Progress updated successfully." });
  } catch (error) {
    // Handle cases where the job might not be found or other DB errors
    if (
      error instanceof Error &&
      error.name === "PrismaClientKnownRequestError"
    ) {
      // @ts-expect-error
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: `Job with ID ${job_id} not found.` },
          { status: 404 },
        );
      }
    }

    console.error(`Error updating job ${job_id}:`, error);
    return NextResponse.json(
      { error: "Failed to update job progress." },
      { status: 500 },
    );
  }
}
