"use client";

import { Navbar } from "@/components/Navbar";
import { TestForm } from "@/components/TestForm";
import { JobHistory } from "@/components/JobHistory";
import { PageWrapper } from "@/components/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <div>
        <Navbar />
        <main className="p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Create New Test</h2>
              <TestForm />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Job History</h2>
              <JobHistory />
            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}