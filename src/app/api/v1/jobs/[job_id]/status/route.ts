import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ job_id: string }> }) {
  const params = await props.params;
  // TODO: Implement fetching job status
  return NextResponse.json({ message: `Job ${params.job_id} status` });
}
