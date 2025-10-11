import { HeroSection } from "@/components/HeroSection";
import { TestForm } from "@/components/TestForm";
import { JobHistory } from "@/components/JobHistory";
import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <PageWrapper>
        <HeroSection />

        <div className="my-8 border-b border-border" />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Create a New Test</h2>
              <TestForm />
            </div>
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold mb-4">Job History</h2>
              <JobHistory />
            </div>
          </div>
        </main>
      </PageWrapper>
    </>
  );
}
