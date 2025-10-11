import { HeroSection } from "@/components/HeroSection";
import { TestForm } from "@/components/TestForm";
import { JobHistory } from "@/components/JobHistory";
import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  return (
    <PageWrapper>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <TestForm />
          </div>
          <div className="lg:col-span-3">
            <JobHistory />
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}
