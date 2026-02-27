import { createClient } from "@supabase/supabase-js";

export const onRequestPost = async ({ request, env }: any) => {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { stripe_customer_id, points, ref } = await request.json();

  if (!stripe_customer_id || !points) {
    return new Response(JSON.stringify({ ok: false, error: "missing params" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 会員取得
  const { data: member, error: mErr } = await supabase
    .from("members")
    .select("*")
    .eq("stripe_customer_id", stripe_customer_id)
    .single();

  if (mErr || !member) {
    return new Response(JSON.stringify({ ok: false, error: "member not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // FIFO消費関数呼び出し
  const { data, error } = await supabase.rpc("spend_points_fifo", {
    p_member_id: member.id,
    p_points: points,
    p_ref: ref ?? "manual_spend",
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, result: data }), {
    headers: { "Content-Type": "application/json" },
  });
};