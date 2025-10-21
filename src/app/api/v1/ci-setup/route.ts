"use server";

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/rest";

import { ciSetupSchema } from "@/lib/schema";

const generateWorkflowYaml = (apiKeySecretName: string, specPath: string) => `
name: AutoRestTest CI

on:
  push:
    branches:
      - main

jobs:
  run-autoresttest:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run AutoRestTest
        run: |
          if [ ! -f "${specPath}" ]; then
            echo "Error: Spec file not found at ${specPath}"
            exit 1
          fi
          SPEC_CONTENT=$(cat ${specPath} | jq -c . | sed "s/'/''/g")
          curl -X POST https://autoresttest.com/api/v1/jobs \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer \${{ secrets.${apiKeySecretName} }}" \\
            -d '{
              "spec": "$SPEC_CONTENT",
              "config": {}
            }'
`;

export async function POST(request: Request) {
  console.log("CI Setup endpoint hit.");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  console.log("Request body:", body);
  const validationResult = ciSetupSchema.safeParse(body);

  console.log("Validation result:", validationResult);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: validationResult.error.flatten() },
      { status: 400 },
    );
  }

  const { repository, specPath, apiKeyName } = validationResult.data;

  try {
    const clerk = await clerkClient();
    const clerkResponse = clerk.users.getUserOauthAccessToken(
      userId,
      "oauth_github",
    );
    const tokenData = await clerkResponse;
    const githubToken = tokenData.data[0]?.token;

    if (!githubToken) {
      console.error("GitHub token not found for user:", userId);
      return NextResponse.json(
        { error: "GitHub account not connected or token not found." },
        { status: 400 },
      );
    }
    console.log("Successfully retrieved GitHub token.");

    const octokit = new Octokit({ auth: githubToken });

    const [owner, repo] = repository.split("/");
    const workflowContent = generateWorkflowYaml(apiKeyName, specPath);

    let existingFileSha: string | undefined;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path: ".github/workflows/autoresttest.yml",
      });
      if (!Array.isArray(existingFile)) {
        existingFileSha = existingFile.sha;
      }
    } catch (error: any) {
      if (error.status !== 404) throw error;
    }

    console.log(`Attempting to create/update workflow in ${repository}`);
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: ".github/workflows/autoresttest.yml",
      message: "ci: Add AutoRestTest workflow",
      content: Buffer.from(workflowContent).toString("base64"),
      sha: existingFileSha,
    });

    console.log("Workflow file created/updated successfully.");
    return NextResponse.json({ message: "Workflow created successfully!" });
  } catch (error: any) {
    console.error("CI Setup Error:", error);
    if (error.status === 404) {
      return NextResponse.json(
        {
          error:
            "Repository not found. Please check the name and ensure you have access.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create workflow file." },
      { status: 500 },
    );
  }
}
