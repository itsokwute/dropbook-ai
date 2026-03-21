import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

const steps = [
  "Researching your market...",
  "Designing your offer...",
  "Writing your ebook...",
  "Generating your cover...",
  "Building your bonus package...",
  "Packaging your files...",
];

const LoadingPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Spinner */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full bg-primary/20 animate-pulse-ring" />
          <Loader2 className="h-12 w-12 text-primary animate-spin-slow" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Creating your ebook...
          </h2>
          <p className="text-sm text-muted-foreground">
            This takes about 60 seconds
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-3 transition-opacity duration-500"
              style={{ opacity: i <= activeStep ? 1 : 0.25 }}
            >
              {i < activeStep ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
              ) : i === activeStep ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin-slow shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-border shrink-0" />
              )}
              <span
                className={`text-sm ${
                  i <= activeStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoadingPage;
