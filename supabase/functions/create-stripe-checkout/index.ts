// Inert scaffold for Stripe Checkout. Returns 503 while Stripe is not configured.
// Once STRIPE_SECRET_KEY is set AND the admin explicitly enables checkout
// (currently gated by CHECKOUT_ENABLED=true env var), this creates a Checkout Session.
// Even then, no payment succeeds without a valid Stripe account.
import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BodySchema = z.object({
  items: z.array(z.object({
    variant_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(10),
  })).min(1).max(20),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const enabled = Deno.env.get('CHECKOUT_ENABLED') === 'true';

  if (!stripeKey || !enabled) {
    return new Response(JSON.stringify({
      error: 'checkout_disabled',
      message: 'Stripe checkout is not enabled. RUVTIER is currently preorder & allocation only.',
    }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const variantIds = parsed.data.items.map(i => i.variant_id);
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id, title, sku, price, currency, stock_quantity, reserved_quantity, status, stripe_price_id, product_id, image_url')
    .in('id', variantIds)
    .eq('status', 'active');

  if (error || !variants || variants.length !== variantIds.length) {
    return new Response(JSON.stringify({ error: 'variant_unavailable' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  for (const item of parsed.data.items) {
    const v = variants.find(x => x.id === item.variant_id)!;
    const available = (v.stock_quantity ?? 0) - (v.reserved_quantity ?? 0);
    if (available < item.quantity) {
      return new Response(JSON.stringify({ error: 'insufficient_stock', variant_id: v.id }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: parsed.data.items.map(item => {
      const v = variants.find(x => x.id === item.variant_id)!;
      return v.stripe_price_id
        ? { price: v.stripe_price_id, quantity: item.quantity }
        : {
            quantity: item.quantity,
            price_data: {
              currency: (v.currency || 'GBP').toLowerCase(),
              unit_amount: Math.round(Number(v.price) * 100),
              product_data: { name: v.title || v.sku, images: v.image_url ? [v.image_url] : [] },
            },
          };
    }),
    success_url: parsed.data.success_url,
    cancel_url: parsed.data.cancel_url,
    metadata: { source: 'ruvtier_web' },
  });

  return new Response(JSON.stringify({ id: session.id, url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
