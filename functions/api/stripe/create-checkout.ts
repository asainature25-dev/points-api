import Stripe from "stripe";

export const onRequestPost = async ({ request, env }: any) => {
  const { line_user_id } = await request.json().catch(() => ({}));

  if (!line_user_id) {
    return new Response(JSON.stringify({ ok: false, error: "line_user_id required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: env.CHECKOUT_SUCCESS_URL,
    cancel_url: env.CHECKOUT_CANCEL_URL,
    // ここが自動紐付けの鍵
    metadata: { line_user_id },
  });

  return new Response(JSON.stringify({ ok: true, url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
};