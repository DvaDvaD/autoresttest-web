import { HeroSection } from "@/components/HeroSection";
import { TestForm } from "@/components/TestForm";
import { JobHistory } from "@/components/JobHistory";
import { Protect, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Protect
        fallback={
          <div className="relative">
            <div className="absolute bg-black/80 inset-0 z-0" />
            <main className="relative container mx-auto flex items-center justify-center px-4 py-16">
              <Card className="w-full max-w-md text-center shadow-xl">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <LogIn className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    Access AutoRestTest
                  </CardTitle>
                  <CardDescription>
                    Please sign in to create and view your tests.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <SignInButton>
                    <Button size="lg">
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In to Continue
                    </Button>
                  </SignInButton>
                </CardFooter>
              </Card>
            </main>
          </div>
        }
      >
        <div className="relative">
          {/* <div className="-z-10 absolute inset-0 z-0"> */}
          {/*   <CosmicWavesShaders /> */}
          {/* </div> */}
          <div className="absolute bg-background inset-0 z-0" />
          <main className="relative container mx-auto px-4 py-8">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">
                  Create a New Test
                </h2>
                <TestForm />
              </div>
              <div className="lg:col-span-3">
                <h2 className="text-xl font-semibold mb-4">Job History</h2>
                <JobHistory />
              </div>
            </div>
          </main>
        </div>
      </Protect>
    </>
  );
}
