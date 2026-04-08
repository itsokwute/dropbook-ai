import HeroSection from "@/components/HeroSection";
import LoadingPage from "@/components/LoadingPage";
import ResultsPage from "@/components/ResultsPage";
import ErrorPage from "@/components/ErrorPage";
import { useEbookGenerator } from "@/hooks/useEbookGenerator";

const Index = () => {
  const { state, result, error, rawResponse, generate, reset } = useEbookGenerator();

  return (
    <div className="min-h-screen bg-background">
      {state === "landing" && <HeroSection onGenerate={generate} />}
      {state === "loading" && <LoadingPage />}
      {state === "results" && result && (
        <ResultsPage
          ebookUrl={result.ebookUrl}
          bonusUrl={result.bonusUrl}
          onReset={reset}
        />
      )}
      {state === "error" && <ErrorPage message={error} onRetry={reset} />}

      {/* Footer */}
      <footer className="fixed bottom-0 inset-x-0 py-4 text-center text-xs text-muted-foreground border-t border-border bg-background/80 backdrop-blur-sm">
        DropBook AI · Turn keywords into ebooks
      </footer>
    </div>
  );
};

export default Index;
