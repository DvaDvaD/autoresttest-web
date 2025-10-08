import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { job_id: string } }) {
  // TODO: Implement fetching job status
  return NextResponse.json({ message: `Job ${params.job_id} status` });
}
