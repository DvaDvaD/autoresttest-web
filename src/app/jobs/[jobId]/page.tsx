"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Navbar } from "@/components/Navbar";
import { PageWrapper } from "@/components/PageWrapper";
import { JobDetailSkeleton } from "@/components/JobDetailSkeleton";

const fetchJob = async (jobId: string) => {
  const response = await fetch(`/api/v1/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch job details");
  }
  return response.json();
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJob(jobId),
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
        <PageWrapper>
            <div>
                <Navbar />
                <main className="p-4 md:p-8">
                    <JobDetailSkeleton />
                </main>
            </div>
        </PageWrapper>
    );
  }

  if (error) return <div>Error loading job details.</div>;
  if (!job) return <div>Job not found.</div>

  const statusData = job.statusCodeCounter ? Object.entries(job.statusCodeCounter).map(([name, value]) => ({ name, count: value as number })) : [];

  return (
    <PageWrapper>
      <div>
          <Navbar />
          <main className="p-4 md:p-8">
              <h1 className="text-3xl font-bold mb-4">Job Details: {job.id}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <Card>
                      <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                      <CardContent>{job.status}</CardContent>
                  </Card>
                  <Card>
                      <CardHeader><CardTitle>Total Requests</CardTitle></CardHeader>
                      <CardContent>{job.summary?.total_requests ?? 'N/A'}</CardContent>
                  </Card>
                  <Card>
                      <CardHeader><CardTitle>Duration</CardTitle></CardHeader>
                      <CardContent>{job.summary?.duration_seconds ?? 'N/A'}s</CardContent>
                  </Card>
              </div>

              {job.statusCodeCounter &&
                  <Card className="mb-8">
                      <CardHeader><CardTitle>Status Code Distribution</CardTitle></CardHeader>
                      <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={statusData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="count" fill="#8884d8" />
                              </BarChart>
                          </ResponsiveContainer>
                      </CardContent>
                  </Card>
              }

              <div className="space-y-4">
                  {job.rawFileUrls?.q_tables && 
                      <Button asChild><a href={job.rawFileUrls.q_tables} target="_blank" rel="noreferrer">Download Q-Tables</a></Button>
                  }
                  {job.rawFileUrls?.server_errors && 
                      <Button asChild><a href={job.rawFileUrls.server_errors} target="_blank" rel="noreferrer">Download Server Errors</a></Button>
                  }
                   {job.rawFileUrls?.successful_requests && 
                      <Button asChild><a href={job.rawFileUrls.successful_requests} target="_blank" rel="noreferrer">Download Successful Requests</a></Button>
                  }
              </div>
          </main>
      </div>
    </PageWrapper>
  );
}