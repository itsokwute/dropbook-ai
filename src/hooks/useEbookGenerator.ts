import { useState } from "react";

type AppState = "landing" | "loading" | "results" | "error";

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

    try {
      const res = await fetch(
        "https://aiaa1.datasciencemasterminds.com/webhook/1a4c03a8-4fd2-4b05-aa2b-6d7fd41e00f2/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: kw }),
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (!data.ebookUrl || !data.bonusUrl) {
        throw new Error("Invalid response from server.");
      }

      setResult(data);
      setState("results");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
