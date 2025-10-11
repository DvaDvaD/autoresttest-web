"use client";

import { Navbar } from "@/components/Navbar";
import { TestForm } from "@/components/TestForm";
import { JobHistory } from "@/components/JobHistory";
import { PageWrapper } from "@/components/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Create New Test</h2>
                <TestForm />
              </div>
              <div className="xl:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Job History</h2>
                <JobHistory />
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}