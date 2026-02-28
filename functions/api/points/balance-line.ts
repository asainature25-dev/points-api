import { createClient } from "@supabase/supabase-js";

export const onRequestGet = async ({ request, env }: any) => {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const url = new URL(request.url);
  const line_user_id = url.searchParams.get("line_user_id");

  if (!line_user_id) {
    return new Response(JSON.stringify({ ok: false, error: "missing line_user_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: member } = await supabase
    .from("members")
    .select("id,status")
    .eq("line_user_id", line_user_id)
    .single();

  if (!member) {
    return new Response(JSON.stringify({ ok: false, error: "member not linked" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: balance } = await supabase
    .from("point_balances")
    .select("balance")
    .eq("member_id", member.id)
    .single();

  return new Response(
    JSON.stringify({ ok: true, status: member.status, balance: balance?.balance ?? 0 }),
    { headers: { "Content-Type": "application/json" } }
  );
};
