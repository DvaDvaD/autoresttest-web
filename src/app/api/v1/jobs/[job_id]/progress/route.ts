import { NextResponse } from 'next/server';

export async function PATCH(request: Request, props: { params: Promise<{ job_id: string }> }) {
  const params = await props.params;
  // TODO: Implement job progress update
  return NextResponse.json({ message: `Job ${params.job_id} progress updated` });
}
