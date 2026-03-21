import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: responseData, error: fnError } = await supabase.functions.invoke(
        "generate-ebook",
        { body: { chatInput: kw } }
      );

      if (fnError) throw new Error(fnError.message);

      if (!responseData.ebookUrl || !responseData.bonusUrl) {
        throw new Error("Invalid response from server.");
      }

      setResult(responseData);
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
