export const onRequestGet = async () => {
  return new Response(JSON.stringify({ message: "API working" }), {
    headers: { "Content-Type": "application/json" },
  });
};