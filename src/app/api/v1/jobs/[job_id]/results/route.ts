import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { job_id: string } }) {
  // TODO: Implement fetching job results
  return NextResponse.json({ message: `Job ${params.job_id} results` });
}
