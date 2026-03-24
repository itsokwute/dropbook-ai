import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const WEBHOOK_URL =
  "https://aiaa1.datasciencemasterminds.com/webhook/1a4c03a8-4fd2-4b05-aa2b-6d7fd41e00f2/chat";

const N8N_TIMEOUT_MS = 120000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatInput } = await req.json();

    if (!chatInput) {
      return new Response(JSON.stringify({ error: "chatInput is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await res.text();
    console.log("n8n status:", res.status);
    console.log("n8n raw response:", responseBody);

    if (!res.ok) {
      return new Response(responseBody, {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(responseBody);
    } catch {
      console.error("Failed to parse n8n response as JSON");
      return new Response(responseBody, {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Return raw response if expected fields are missing
    if (!parsed.ebookUrl || !parsed.bonusUrl) {
      console.log("Missing ebookUrl or bonusUrl, returning raw response");
      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ebookUrl: parsed.ebookUrl, bonusUrl: parsed.bonusUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("n8n webhook timed out after 120s");
      return new Response(JSON.stringify({ error: "Service timed out" }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Edge function error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
