import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AppState = "landing" | "loading" | "results" | "error";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function base64ToBlob(base64: string, mime: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
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
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: kw }),
      });

      if (!response.ok) {
        throw new Error("Webhook request failed.");
      }

      const data = await response.json();
      const { ebookData, bonusData } = data;

      if (!ebookData || !bonusData) {
        throw new Error("Missing ebook or bonus data in response.");
      }

      const ebookBlob = base64ToBlob(ebookData, DOCX_MIME);
      const bonusBlob = base64ToBlob(bonusData, DOCX_MIME);

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
