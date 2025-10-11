"use client";

import { SparksDriftingShaders } from "@/components/ui/shadcn-io/sparks-drifting-shaders";

export function HeroSection() {
  return (
    <section className="relative py-28 text-center">
      <div className="absolute inset-0 z-0">
        <SparksDriftingShaders />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Intelligent, Automated API Security Testing
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          <strong>AutoRestTest Web</strong> harnesses the power of Multi-Agent
          Reinforcement Learning to automatically discover vulnerabilities and
          weaknesses in your API. Simply provide your OpenAPI specification,
          configure your test, and let our AI agents intelligently explore your
          endpoints to find security flaws before they become a problem.
        </p>
      </div>
    </section>
  );
}

