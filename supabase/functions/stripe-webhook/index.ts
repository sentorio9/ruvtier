// Stripe webhook receiver. Inert until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set.
// - Verifies signature
// - Deduplicates via payment_events.stripe_event_id
// - Stores a safe (non-PII, non-card) payload snapshot
// - Never marks orders as paid unless the event is fully verified
import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const whSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeKey || !whSecret) {
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(stripeKey);
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400, headers: corsHeaders });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, whSecret);
  } catch (err) {
    return new Response(`Signature error: ${(err as Error).message}`, {
      status: 400, headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Build a safe payload: strip PII, card data, and raw customer contact info.
  const obj = event.data.object as Record<string, unknown>;
  const safe: Record<string, unknown> = {
    id: obj.id,
    amount_total: obj.amount_total,
    currency: obj.currency,
    payment_status: obj.payment_status,
    status: obj.status,
    mode: obj.mode,
  };

  const paymentIntentId = (obj as any).payment_intent ?? null;
  const checkoutSessionId = event.type.startsWith('checkout.session.') ? obj.id : null;

  // Idempotent insert
  const { error: insErr } = await supabase.from('payment_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payment_intent_id: paymentIntentId,
    checkout_session_id: checkoutSessionId,
    safe_payload: safe,
    processed: false,
  });

  if (insErr && !insErr.message.includes('duplicate')) {
    return new Response(JSON.stringify({ error: 'store_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Order-side handling stays intentionally minimal until orders are wired up.
  // Once the orders/checkout flow is live, dispatch here on event.type.
  await supabase.from('payment_events')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq('stripe_event_id', event.id);

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
