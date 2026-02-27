import { createClient } from "@supabase/supabase-js";

export const onRequestPost = async ({ request, env }: any) => {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("members")
    .insert({ stripe_customer_id: "test_customer" })
    .select();

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { "Content-Type": "application/json" },
  });
};