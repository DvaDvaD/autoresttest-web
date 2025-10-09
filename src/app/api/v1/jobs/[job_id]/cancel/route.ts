import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server"; // TODO: Re-enable when Clerk is implemented
import { runs } from "@trigger.dev/sdk/v3";

type RouteParams = {
  params: {
    job_id: string;
  };
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { job_id: jobId } = params; // Match the route parameter

    // TODO: Replace this placeholder with actual Clerk authentication
    const userId = "user_placeholder_for_testing";
    // const { userId } = auth();

    // 1. Authentication: Ensure user is logged in
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Authorization: Verify the user owns this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // if (job.userId !== userId) {
    //   return new NextResponse("Forbidden", { status: 403 });
    // }

    // 3. Find the Trigger.dev run associated with this job
    // This assumes you add a `jobId` tag when triggering the task
    const runList = await runs.list({ tag: jobId, limit: 1 });
    const runToCancel = runList.data[0];

    if (!runToCancel) {
      // If no run is found, the job might have already completed or failed.
      // We can check our own DB for the status.
      const currentJob = await prisma.job.findUnique({
        where: { id: jobId },
        select: { status: true },
      });
      if (
        currentJob?.status === "completed" ||
        currentJob?.status === "failed" ||
        currentJob?.status === "cancelled"
      ) {
        return NextResponse.json(
          {
            message:
              "Job is already in a terminal state and cannot be cancelled.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Could not find an active run for this job." },
        { status: 404 },
      );
    }

    // 4. Send the cancel command to Trigger.dev
    await runs.cancel(runToCancel.id);

    // Note: The global onCancel hook in your trigger/api-test.ts file
    // will be responsible for updating the job status in the database to "cancelled".

    return NextResponse.json({
      message: "Cancellation request sent successfully.",
    });
  } catch (error) {
    console.error(`Error cancelling job ${params.job_id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

