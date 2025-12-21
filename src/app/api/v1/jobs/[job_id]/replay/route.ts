import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { runs } from "@trigger.dev/sdk/v3";
import { ensureUserCanMutate } from "@/lib/permissions";

type RouteParams = { params: Promise<{ job_id: string }> };

export async function POST(request: Request, props: RouteParams) {
  const { job_id: jobId } = await props.params;

  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      await ensureUserCanMutate(userId);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`Attempting to replay job: ${jobId} for user: ${userId}`);

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: userId, // Authorize: ensure the user owns this job
      },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you do not have permission to replay it." },
        { status: 404 },
      );
    }

    const runList = await runs.list({ tag: jobId, limit: 1 });
    const runToReplay = runList.data[0];

    if (!runToReplay) {
      return NextResponse.json(
        { error: "Could not find an active run for this job." },
        { status: 404 },
      );
    }

    await runs.replay(runToReplay.id);

    return NextResponse.json({
      message: "Replay request sent successfully.",
      jobId: jobId,
    });
  } catch (error) {
    console.error(`Error replaying job ${jobId}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
