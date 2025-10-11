import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type RouteParams = { params: { job_id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { job_id: jobId } = params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
    console.error(`Error fetching job ${params.job_id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
