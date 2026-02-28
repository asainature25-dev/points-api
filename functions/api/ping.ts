export const onRequestGet = async () => {
  return new Response(JSON.stringify({ ok: true, ping: "pong" }), {
    headers: { "Content-Type": "application/json" },
  });
};
