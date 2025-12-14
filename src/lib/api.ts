"use client";
import { TJob } from "./schema";

// A central file for all API-related functions.

/**
 * Fetches the details for a single job.
 * @param jobId The ID of the job to fetch.
 * @returns A promise that resolves to the Job object.
 */
export async function fetchJob(jobId: string): Promise<TJob> {
  const res = await fetch(`/api/v1/jobs/${jobId}`);
  if (!res.ok) {
    // You can add more specific error handling here if needed
    const errorBody = await res.text();
    throw new Error(
      `Network response was not ok: ${res.statusText} - ${errorBody}`,
    );
  }
  return res.json();
}

/**
 * Fetches the list of all jobs for the current user.
 */
export async function fetchJobs(): Promise<TJob[]> {
  const res = await fetch("/api/v1/jobs");
  if (!res.ok) {
    throw new Error("Failed to fetch job history");
  }
  return res.json();
}

/**
 * Creates a new test job.
 * @param data The job creation payload (spec and config).
 */
export async function createJob(data: unknown): Promise<{ jobId: string }> {
  const response = await fetch("/api/v1/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create job");
  }

  return response.json();
}

/**
 * Sends a request to cancel a job.
 * @param jobId The ID of the job to cancel.
 */
export async function cancelJob(jobId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/v1/jobs/${jobId}/cancel`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to cancel job");
  }

  return response.json();
}

/**
 * Deletes a job.
 * @param jobId The ID of the job to delete.
 */
export async function deleteJob(jobId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/v1/jobs/${jobId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to delete job" }));
    throw new Error(errorData.error || "Failed to delete job");
  }

  return response.json();
}

/**
 * Sends a request to replay a job.
 * @param jobId The ID of the job to replay.
 */
export async function replayJob(jobId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/v1/jobs/${jobId}/replay`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to replay job" }));
    throw new Error(errorData.error || "Failed to replay job");
  }

  return response.json();
}

/**
 * A generic fetcher for any raw data file from a URL.
 * @param url The URL of the file to fetch.
 */
export async function fetchRawData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json() as Promise<T>;
}

/**
 * Sets up CI workflow in the specified repository.
 * @param data The CI setup payload.
 */
export async function setupCI(data: {
  repository: string;
  specPath: string;
  apiKeyName: string;
}) {
  const response = await fetch("/api/v1/ci-setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to set up CI workflow.");
  }
  return response.json();
}
