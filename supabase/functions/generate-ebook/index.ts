import { corsHeaders } from '@supabase/supabase-js/cors'

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

    const data = await response.json();

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
