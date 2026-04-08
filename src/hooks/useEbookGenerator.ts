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
  const [rawResponse, setRawResponse] = useState("");

  const generate = async (kw: string) => {
    setKeyword(kw);
    setState("loading");
    setError("");
    setRawResponse("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-ebook",
        { body: { chatInput: kw } }
      );

      if (fnError) {
        throw new Error(fnError.message || "Edge function request failed.");
      }

      if (data?.rawResponse) {
        setRawResponse(typeof data.rawResponse === 'string' ? data.rawResponse : JSON.stringify(data.rawResponse, null, 2));
      }

      const { ebookData, bonusData } = data;

      if (!ebookData || !bonusData) {
        const msg = data?.error || "Missing ebook or bonus data in response.";
        throw new Error(msg);
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
    setRawResponse("");
  };

  return { state, keyword, result, error, rawResponse, generate, reset };
}
