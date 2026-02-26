export const onRequestPost = async ({ request }: { request: Request }) => {
  const body = await request.text();

  console.log("Stripe webhook received");

  return new Response(
    JSON.stringify({
      received: true,
      bodyLength: body.length,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};