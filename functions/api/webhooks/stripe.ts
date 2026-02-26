export const onRequestGet = async () => {
  return new Response(JSON.stringify({ ok: true, route: "webhooks/stripe" }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const onRequestPost = async ({ request }: { request: Request }) => {
  const body = await request.text();
  return new Response(JSON.stringify({ received: true, bodyLength: body.length }), {
    headers: { "Content-Type": "application/json" },
  });
};