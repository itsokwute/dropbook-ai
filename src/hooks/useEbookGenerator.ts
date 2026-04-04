import { useState } from "react";

type AppState = "landing" | "loading" | "results" | "error";

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/generate-ebook`;

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function base64ToBlobUrl(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: DOCX_MIME });
  return URL.createObjectURL(blob);
}

interface ResultData {
  ebookUrl: string;
  bonusUrl: string;
}

export function useEbookGenerator() {
  const [state, setState] = useState<AppState>("landing");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");

  const generate = async (kw: string) => {
    setKeyword(kw);
    setState("loading");
    setError("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ chatInput: kw }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();

      const ebookUrl = base64ToBlobUrl(data.ebookData);
      const bonusUrl = base64ToBlobUrl(data.bonusData);

      setResult({ ebookUrl, bonusUrl });
      setState("results");
    } catch (err: any) {
      const message =
        err.name === "AbortError"
          ? "Request timed out. Please try again."
          : err.message || "Something went wrong.";
      setError(message);
      setState("error");
    }
  };

  const reset = () => {
    // Revoke blob URLs to free memory
    if (result) {
      URL.revokeObjectURL(result.ebookUrl);
      URL.revokeObjectURL(result.bonusUrl);
    }
    setState("landing");
    setKeyword("");
    setResult(null);
    setError("");
  };

  return { state, keyword, result, error, generate, reset };
}
