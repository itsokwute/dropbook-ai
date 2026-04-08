import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorPageProps {
  message: string;
  rawResponse?: string;
  onRetry: () => void;
}

const ErrorPage = ({ message, rawResponse, onRetry }: ErrorPageProps) => (
  <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
    <div className="max-w-2xl w-full text-center space-y-6 animate-fade-up">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        Something went wrong
      </h2>
      <p className="text-muted-foreground text-sm">{message}</p>
      {rawResponse && (
        <div className="text-left">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Raw response from server:</p>
          <pre className="bg-muted rounded-lg p-4 text-xs text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap break-all">
            {rawResponse}
          </pre>
        </div>
      )}
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  </section>
);

export default ErrorPage;
