"use client";

export function HeroSection() {
  return (
    <section className="relative py-28 text-center">
      {/* <div className="absolute inset-0 z-0"> */}
      {/*   <SparksDriftingShaders /> */}
      {/* </div> */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Intelligent, Automated API Quality &amp; Security Testing
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          <strong>AutoRestTest Web</strong> harnesses a powerful combination of{" "}
          <strong>Large Language Models (LLMs)</strong> and{" "}
          <strong>Multi-Agent Reinforcement Learning</strong> to automatically
          discover bugs, vulnerabilities, and unexpected behaviors in your API.
          Simply provide your OpenAPI specification, configure your test, and
          let our AI agents intelligently explore your endpoints to ensure your
          API is robust, reliable, and secure.
        </p>
      </div>
    </section>
  );
}
