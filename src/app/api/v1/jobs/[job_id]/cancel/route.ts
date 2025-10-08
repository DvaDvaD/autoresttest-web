import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { job_id: string } }) {
  // TODO: Implement job cancellation
  return NextResponse.json({ message: `Job ${params.job_id} cancelled` });
}
