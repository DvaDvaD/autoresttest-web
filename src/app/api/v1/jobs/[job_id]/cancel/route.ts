import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { runs } from "@trigger.dev/sdk/v3";

type RouteParams = { params: { job_id: string } };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { job_id: jobId } = params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`Attempting to cancel job: ${jobId} for user: ${userId}`);

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: userId, // Authorize: ensure the user owns this job
      },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you do not have permission to cancel it." },
        { status: 404 },
      );
    }

    const runList = await runs.list({ tag: jobId, limit: 1 });
    const runToCancel = runList.data[0];

    if (!runToCancel) {
      return NextResponse.json(
        { error: "Could not find an active run for this job." },
        { status: 404 },
      );
    }

    await runs.cancel(runToCancel.id);

    return NextResponse.json({
      message: "Cancellation request sent successfully.",
    });
  } catch (error) {
    console.error(`Error cancelling job ${params.job_id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

