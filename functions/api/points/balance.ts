import { createClient } from "@supabase/supabase-js";

export const onRequestGet = async ({ request, env }: any) => {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const url = new URL(request.url);
  const stripe_customer_id = url.searchParams.get("stripe_customer_id");

  if (!stripe_customer_id) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing stripe_customer_id" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("stripe_customer_id", stripe_customer_id)
    .single();

  if (!member) {
    return new Response(JSON.stringify({ ok: false, error: "member not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: balance } = await supabase
    .from("point_balances")
    .select("balance")
    .eq("member_id", member.id)
    .single();

  return new Response(JSON.stringify({ ok: true, balance: balance?.balance ?? 0 }), {
    headers: { "Content-Type": "application/json" },
  });
};
