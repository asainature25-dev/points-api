import { createClient } from "@supabase/supabase-js";

export const onRequestPost = async ({ request, env }: any) => {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { stripe_customer_id, points } = await request.json();

  if (!stripe_customer_id || !points) {
    return new Response(JSON.stringify({ ok: false, error: "missing params" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 会員を取得（なければ作成）
  const { data: member, error: mErr } = await supabase
    .from("members")
    .upsert({ stripe_customer_id }, { onConflict: "stripe_customer_id" })
    .select()
    .single();

  if (mErr) {
    return new Response(JSON.stringify({ ok: false, error: mErr }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 付与（bucket + ledger + balance）
  // expires_at は DB関数 expires_on(CURRENT_DATE) を使う
  const { data: bucket, error: bErr } = await supabase
    .from("point_buckets")
    .insert({
      member_id: member.id,
      granted: points,
      remaining: points,
      // Supabase JSからDB関数を直接使いにくいので、一旦JSで計算してもOK
      // ここではサーバー側で計算するため、後でRPCに寄せる（次ステップ）
      expires_at: new Date(new Date().getFullYear(), new Date().getMonth() + 3, 0)
        .toISOString()
        .slice(0, 10),
    })
    .select()
    .single();

  if (bErr) {
    return new Response(JSON.stringify({ ok: false, error: bErr }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  await supabase.from("point_ledger").insert({
    member_id: member.id,
    type: "grant",
    amount: points,
    ref: `manual:${stripe_customer_id}`,
  });

  // balance を upsert（+points）
  const { data: existing } = await supabase
    .from("point_balances")
    .select("balance")
    .eq("member_id", member.id)
    .maybeSingle();

  const newBalance = (existing?.balance ?? 0) + points;

  await supabase.from("point_balances").upsert({
    member_id: member.id,
    balance: newBalance,
    updated_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ ok: true, member, bucket, balance: newBalance }), {
    headers: { "Content-Type": "application/json" },
  });
};