import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ensureUserCanMutate } from "@/lib/permissions";

type RouteParams = { params: Promise<{ job_id: string }> };

export async function GET(request: Request, props: RouteParams) {
  const { job_id: jobId } = await props.params;

  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(`Fetching job details for job: ${jobId}, user: ${userId}`);

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
        userId: userId, // Ensure the job belongs to the authenticated user
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
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

    console.log(`Attempting to delete job: ${jobId} for user: ${userId}`);

    const deleteResult = await prisma.job.deleteMany({
      where: {
        id: jobId,
        userId: userId,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: "Job not found or you are not authorized to delete it" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
