import { useState } from "react";

type AppState = "landing" | "loading" | "results" | "error";

const WEBHOOK_URL =
  "https://aiaa1.datasciencemasterminds.com/webhook/1a4c03a8-4fd2-4b05-aa2b-6d7fd41e00f2/chat";

const EBOOK_URL =
  "https://res.cloudinary.com/dmmsnesjt/raw/upload/dropbook-ebook";
const BONUS_URL =
  "https://res.cloudinary.com/dmmsnesjt/raw/upload/dropbook-bonus";

const POLL_URL =
  "https://res.cloudinary.com/dmmsnesjt/raw/upload/v1774747310/dropbook-ebook";

const POLL_INTERVAL_MS = 5000;
const MAX_WAIT_MS = 120000;

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

    // Fire-and-forget: trigger the n8n chat workflow
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput: kw }),
    }).catch(() => {
      // Ignore errors — we poll for the result instead
    });

    // Poll Cloudinary to check if the file is ready, up to 120s
    const start = Date.now();

    const poll = (): Promise<boolean> =>
      new Promise((resolve) => {
        const check = async () => {
          try {
            const res = await fetch(POLL_URL, { method: "HEAD" });
            if (res.ok) {
              resolve(true);
              return;
            }
          } catch {
            // not ready yet
          }

          if (Date.now() - start >= MAX_WAIT_MS) {
            resolve(true); // show results anyway after timeout
            return;
          }

          setTimeout(check, POLL_INTERVAL_MS);
        };
        check();
      });

    await poll();

    setResult({ ebookUrl: EBOOK_URL, bonusUrl: BONUS_URL });
    setState("results");
  };

  const reset = () => {
    setState("landing");
    setKeyword("");
    setResult(null);
    setError("");
  };

  return { state, keyword, result, error, generate, reset };
}
