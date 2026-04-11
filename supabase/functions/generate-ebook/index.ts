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

    // Location 1: top-level keys
    if (parsed.ebookData && parsed.bonusData) {
      ebookData = parsed.ebookData;
      bonusData = parsed.bonusData;
    }
    // Location 2: array wrapper
    else if (Array.isArray(parsed) && parsed[0]?.ebookData && parsed[0]?.bonusData) {
      ebookData = parsed[0].ebookData;
      bonusData = parsed[0].bonusData;
    }
    // Location 3: nested .data
    else if (parsed.data?.ebookData && parsed.data?.bonusData) {
      ebookData = parsed.data.ebookData;
      bonusData = parsed.data.bonusData;
    }
    // Location 4: ConvertAPI Files[0].FileData structure
    else if (Array.isArray(parsed) && parsed[0]?.Files?.[0]?.FileData && parsed[1]?.Files?.[0]?.FileData) {
      ebookData = parsed[0].Files[0].FileData;
      bonusData = parsed[1].Files[0].FileData;
    }
    // Location 5: single object with Files array (ebook + bonus as two entries)
    else if (parsed.Files?.[0]?.FileData) {
      ebookData = parsed.Files[0].FileData;
      bonusData = parsed.Files[0].FileData;
    }
// Strip data-URI prefix if present
    const stripPrefix = (s: string) => s.includes(',') && s.startsWith('data:') ? s.split(',')[1] : s;
    if (ebookData) ebookData = stripPrefix(ebookData);
    if (bonusData) bonusData = stripPrefix(bonusData);
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
