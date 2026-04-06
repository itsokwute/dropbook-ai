import { useState } from "react";

type AppState = "landing" | "loading" | "results" | "error";

const N8N_WEBHOOK_URL =
  "https://aiaa1.datasciencemasterminds.com/webhook/1a4c03a8-4fd2-4b05-aa2b-6d7fd41e00f2/chat";

const EBOOK_URL =
  "https://res.cloudinary.com/dmmsnesjt/raw/upload/dropbook-ebook";
const BONUS_URL =
  "https://res.cloudinary.com/dmmsnesjt/raw/upload/dropbook-bonus";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const WAIT_MS = 110_000;

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
      fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: kw }),
        mode: "no-cors",
      }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, WAIT_MS));

      const [ebookRes, bonusRes] = await Promise.all([
        fetch(EBOOK_URL),
        fetch(BONUS_URL),
      ]);

      if (!ebookRes.ok || !bonusRes.ok) {
        throw new Error("Failed to fetch ebook files.");
      }

      const [ebookBuf, bonusBuf] = await Promise.all([
        ebookRes.arrayBuffer(),
        bonusRes.arrayBuffer(),
      ]);

      const ebookBlob = new Blob([ebookBuf], { type: DOCX_MIME });
      const bonusBlob = new Blob([bonusBuf], { type: DOCX_MIME });

      setResult({
        ebookUrl: URL.createObjectURL(ebookBlob),
        bonusUrl: URL.createObjectURL(bonusBlob),
      });
      setState("results");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setState("error");
    }
  };

  const reset = () => {
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
