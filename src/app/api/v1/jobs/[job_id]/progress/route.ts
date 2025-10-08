import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ job_id: string }> },
) {
  const params = await props.params;
  // TODO: Implement job progress update

  const body = await request.json();
  console.log(
    `Received the following params and body\nparams: ${JSON.stringify(params, null, 2)}\nbody: ${JSON.stringify(body, null, 2)}`,
  );

  return NextResponse.json({
    message: `Job ${params.job_id} progress updated`,
  });
}
