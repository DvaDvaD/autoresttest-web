export function Footer() {
  return (
    <footer className="border-t border-border py-10 text-muted-foreground">
      <div className="container mx-auto px-4 text-center text-sm">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              About This Project
            </h3>
            <p>
              This web application serves as a user interface for the powerful{" "}
              <strong>AutoRestTest</strong> model. It was developed as part of a
              final year capstone research project to explore the usability and
              application of advanced AI in automated security testing. The goal
              is to make sophisticated API analysis tools more accessible to
              developers and security professionals.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Acknowledgements
            </h3>
            <p>
              The core testing engine, the <strong>AutoRestTest</strong>{" "}
              Multi-Agent Reinforcement Learning model, was developed by the
              original research team. This web application is a separate project
              that provides a user-friendly interface to interact with their
              innovative work. We extend our sincere gratitude to the model's
              creators for their foundational contribution to the field of
              automated API security.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
