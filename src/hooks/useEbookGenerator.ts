import { useState } from "react";

type AppState = "landing" | "loading" | "results" | "error";

interface ResultData {
  ebookUrl: string;
  bonusUrl: string;
}

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/generate-ebook`;

const TIMEOUT_MS = 120000;

export function useEbookGenerator() {
  const [state, setState] = useState<AppState>("landing");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");

  const generate = async (kw: string) => {
    setKeyword(kw);
    setState("loading");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: kw }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text}`);
      }

      const data = await response.json();

      if (!data.ebookUrl || !data.bonusUrl) {
        throw new Error("Invalid response: missing download URLs.");
      }

      setResult({ ebookUrl: data.ebookUrl, bonusUrl: data.bonusUrl });
      setState("results");
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
      setState("error");
    }
  };

  const reset = () => {
    setState("landing");
    setKeyword("");
    setResult(null);
    setError("");
  };

  return { state, keyword, result, error, generate, reset };
}
