import { NextResponse } from 'next/server';

export async function POST(request: Request, props: { params: Promise<{ job_id: string }> }) {
  const params = await props.params;
  // TODO: Implement job cancellation
  return NextResponse.json({ message: `Job ${params.job_id} cancelled` });
}
