// Read-only status endpoint. Reports which Stripe env vars are configured.
// Never returns any secret values.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace('Bearer ', '');
  const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
  if (cErr || !claims?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify admin role
  const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: claims.claims.sub });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const secretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
  const siteUrl = Deno.env.get('SITE_URL') || '';

  const mode = secretKey.startsWith('sk_live_')
    ? 'live'
    : secretKey.startsWith('sk_test_')
    ? 'test'
    : 'none';

  return new Response(JSON.stringify({
    stripe_secret_key_configured: !!secretKey,
    stripe_webhook_secret_configured: !!webhookSecret,
    site_url_configured: !!siteUrl,
    mode,
    checkout_enabled: false, // Flipped to true only after full go-live approval.
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
