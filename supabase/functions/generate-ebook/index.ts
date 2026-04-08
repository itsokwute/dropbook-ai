const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const N8N_WEBHOOK_URL =
  'https://aiaa1.datasciencemasterminds.com/webhook/generate-ebook';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { chatInput } = await req.json();

    if (!chatInput || typeof chatInput !== 'string') {
      return new Response(JSON.stringify({ error: 'chatInput is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n webhook error:", response.status, errorText);
      return new Response(JSON.stringify({ error: `n8n webhook failed: ${response.statusText}`, rawResponse: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawText = await response.text();
    console.log("Raw n8n response:", rawText);

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse n8n response as JSON");
      return new Response(JSON.stringify({ error: 'Non-JSON response from n8n', rawResponse: rawText }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let ebookData: string | null = null;
    let bonusData: string | null = null;

    // Try location 1: top-level
    if (parsed.ebookData && parsed.bonusData) {
      ebookData = parsed.ebookData;
      bonusData = parsed.bonusData;
    }
    // Try location 2: array[0]
    else if (Array.isArray(parsed) && parsed[0]?.ebookData && parsed[0]?.bonusData) {
      ebookData = parsed[0].ebookData;
      bonusData = parsed[0].bonusData;
    }
    // Try location 3: nested .data
    else if (parsed.data?.ebookData && parsed.data?.bonusData) {
      ebookData = parsed.data.ebookData;
      bonusData = parsed.data.bonusData;
    }

    if (ebookData && bonusData) {
      return new Response(JSON.stringify({ ebookData, bonusData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.warn("ebookData/bonusData not found. Raw response:", rawText);
    return new Response(JSON.stringify({ error: 'ebookData or bonusData not found in response', rawResponse: rawText }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error:', err);
    const status = err.name === 'AbortError' ? 504 : 500;
    const message = err.name === 'AbortError' ? 'Request timed out' : err.message;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
