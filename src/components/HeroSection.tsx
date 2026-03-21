import { useState } from "react";
import { Zap, PenTool, ImageIcon, FileText } from "lucide-react";

interface HeroSectionProps {
  onGenerate: (keyword: string) => void;
}

const HeroSection = ({ onGenerate }: HeroSectionProps) => {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) onGenerate(keyword.trim());
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Badge */}
        <div
          className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
          style={{ animationDelay: "0ms" }}
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          AI-Powered Ebook Generator
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08]"
          style={{ animationDelay: "80ms" }}
        >
          Turn One Keyword Into a{" "}
          <span className="text-gradient">Sellable Ebook</span> — In Minutes
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto"
          style={{ animationDelay: "160ms" }}
        >
          Powered by AI. No writing. No design. Just results.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          style={{ animationDelay: "240ms" }}
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder='Enter your keyword e.g. how to save money'
            className="flex-1 rounded-lg border border-border bg-muted/40 px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          <button
            type="submit"
            disabled={!keyword.trim()}
            className="rounded-lg bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed glow-primary-sm sm:w-auto w-full"
          >
            Generate My Ebook
          </button>
        </form>

        {/* Powered by */}
        <p
          className="animate-fade-up text-xs text-muted-foreground tracking-wide"
          style={{ animationDelay: "320ms" }}
        >
          Powered by GPT-4 · DALL-E 3 · ConvertAPI
        </p>

        {/* Feature cards */}
        <div
          className="animate-fade-up grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8"
          style={{ animationDelay: "400ms" }}
        >
          <FeatureCard
            icon={<PenTool className="h-5 w-5 text-primary" />}
            title="AI Writes It"
            description="Full ebook with chapters, research, and formatting"
          />
          <FeatureCard
            icon={<ImageIcon className="h-5 w-5 text-secondary" />}
            title="AI Designs the Cover"
            description="Professional cover art generated to match your topic"
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5 text-primary" />}
            title="Delivered as DOCX"
            description="Ready to upload to Amazon KDP or any platform"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-border bg-card/60 p-6 text-left space-y-3 transition-colors hover:border-primary/30">
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default HeroSection;
