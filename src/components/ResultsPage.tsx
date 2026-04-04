import { useEffect } from "react";
import { Download, FileText, Gift, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

interface ResultsPageProps {
  ebookUrl: string;
  bonusUrl: string;
  onReset: () => void;
}

const ResultsPage = ({ ebookUrl, bonusUrl, onReset }: ResultsPageProps) => {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#00C896", "#FF6B35", "#ffffff"],
    });
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div className="animate-fade-up space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Your Ebook Is <span className="text-gradient">Ready!</span>
          </h1>
          <p className="text-muted-foreground">
            Download your files below and start selling.
          </p>
        </div>

        <div
          className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-5"
          style={{ animationDelay: "120ms" }}
        >
          <DownloadCard
            icon={<FileText className="h-6 w-6 text-primary" />}
            title="Main Ebook"
            filename="ebook.docx"
            url={ebookUrl}
          />
          <DownloadCard
            icon={<Gift className="h-6 w-6 text-secondary" />}
            title="Bonus Package"
            filename="bonus.docx"
            url={bonusUrl}
          />
        </div>

        <button
          onClick={onReset}
          className="animate-fade-up inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          style={{ animationDelay: "240ms" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Generate Another
        </button>
      </div>
    </section>
  );
};

const DownloadCard = ({
  icon,
  title,
  filename,
  url,
}: {
  icon: React.ReactNode;
  title: string;
  filename: string;
  url: string;
}) => (
  <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4 text-left">
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground">{filename}</p>
    <a
      href={url}
      download={filename}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] glow-primary-sm w-full justify-center"
    >
      <Download className="h-4 w-4" />
      Download
    </a>
  </div>
);

export default ResultsPage;
