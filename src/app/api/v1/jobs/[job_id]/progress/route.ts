import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: { job_id: string } }) {
  // TODO: Implement job progress update
  return NextResponse.json({ message: `Job ${params.job_id} progress updated` });
}
