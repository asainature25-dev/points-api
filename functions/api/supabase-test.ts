import { createClient } from "@supabase/supabase-js";

export const onRequestGet = async ({ env }: any) => {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const testId = `test_${Date.now()}`;

  const { data, error } = await supabase
    .from("members")
    .insert({ stripe_customer_id: testId })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, inserted: data }), {
    headers: { "Content-Type": "application/json" },
  });
};