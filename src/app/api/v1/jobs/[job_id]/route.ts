import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { job_id: string } },
) {
  const { job_id } = params;

  // TODO: Add Clerk authentication here to ensure the user can only access their own jobs.

  try {
    const job = await prisma.job.findUnique({
      where: { id: job_id },
    });

    if (!job) {
      return NextResponse.json({ error: `Job with ID ${job_id} not found.` }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(`Error fetching job ${job_id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch job details." },
      { status: 500 },
    );
  }
}