const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const N8N_WEBHOOK_URL =
  'https://aiaa1.datasciencemasterminds.com/webhook/1a4c03a8-4fd2-4b05-aa2b-6d7fd41e00f2/chat';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatInput } = await req.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('n8n response:', JSON.stringify(data));

    return new Response(JSON.stringify(data), {
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
