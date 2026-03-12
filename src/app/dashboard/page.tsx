import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { getDashboardCampaigns } from "@/lib/campaigns";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

const tasks = [
  "スタッフ承認フローを `RLS` 前提で追加する",
  "リターン編集 UI を作る",
  "活動報告の投稿機能を実装する",
  "注文一覧と入金反映を接続する",
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const isSupabaseConfigured = hasSupabaseEnv();

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
        <div className="w-full max-w-2xl rounded-[2rem] bg-white/10 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Supabase 設定待ち
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            ダッシュボード保護を有効にするには、`.env.local` に
            `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`
            を設定してください。
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            ログイン画面へ
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ?? user.user_metadata?.display_name ?? user.email ?? "ログインユーザー";
  const role = (profile?.role ?? "supporter") as UserRole;
  const campaigns = await getDashboardCampaigns(user.id, role);
  const pendingReviewCount = campaigns.filter(
    (campaign) => campaign.status === "pending_review",
  ).length;
  const monthlyRaisedAmount = campaigns.reduce(
    (sum, campaign) => sum + campaign.raisedAmount,
    0,
  );
  const canCreateCampaign = role === "talent";
  const dashboardCards = [
    {
      label: role === "talent" ? "自分の案件数" : "閲覧可能な案件数",
      value: `${campaigns.length}件`,
    },
    {
      label: "審査待ち",
      value: `${pendingReviewCount}件`,
    },
    {
      label: "累計支援額",
      value: formatCurrency(monthlyRaisedAmount),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              管理ダッシュボード
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              ログインユーザーとして `{displayName}` を認識しました。`Supabase` の案件データをもとに一覧とサマリーを表示しています。
            </p>
          </div>
          <LogoutButton />
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-pink-500 p-6 text-slate-950">
            <p className="text-sm opacity-80">現在のロール</p>
            <p className="mt-3 text-3xl font-semibold">{role}</p>
            <p className="mt-3 text-sm leading-7">
              `profiles.role` を使って `RLS` と画面表示を切り分けます。
            </p>
          </div>
          {dashboardCards.map((card) => (
            <div key={card.label} className="rounded-[2rem] bg-white/10 p-6">
              <p className="text-sm text-slate-300">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white/10 p-6">
            <h2 className="text-xl font-semibold">直近のタスク</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              {tasks.map((task) => (
                <li key={task}>・ {task}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] bg-pink-500 p-6 text-slate-950">
            <h2 className="text-xl font-semibold">案件管理</h2>
            {canCreateCampaign ? (
              <>
                <p className="mt-4 text-sm leading-7">
                  案件の新規作成導線を追加済みです。次はリターン管理と編集画面を追加します。
                </p>
                <Link
                  href="/dashboard/campaigns/new"
                  className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  新規案件を作成
                </Link>
              </>
            ) : (
              <p className="mt-4 text-sm leading-7">
                現在のロールではセルフサービスの案件作成はできません。`talent` ロールのユーザーでログインしてください。
              </p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white/10 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">案件一覧</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                `talent` は自分の案件のみ、`staff` と `super_admin` は全案件を表示します。
              </p>
            </div>
            <Link
              href="/campaigns"
              className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium"
            >
              公開ページを見る
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <article
                  key={campaign.id}
                  className="rounded-2xl border border-white/10 bg-black/10 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-pink-300">{campaign.talentName}</p>
                      <h3 className="mt-2 text-xl font-semibold">{campaign.title}</h3>
                      <p className="mt-3 text-sm text-slate-300">
                        ステータス: {campaign.status} / 終了日: {campaign.endDate}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-slate-400">支援額 / 目標額</p>
                      <p className="mt-2 text-lg font-semibold">
                        {formatCurrency(campaign.raisedAmount)} /{" "}
                        {formatCurrency(campaign.goalAmount)}
                      </p>
                      <Link
                        href={`/campaigns/${campaign.slug}`}
                        className="mt-4 inline-flex text-sm font-medium text-pink-300"
                      >
                        公開ページを開く
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-6 text-sm leading-7 text-slate-300">
                表示できる案件がありません。`talents` テーブルと `campaigns` テーブルの関連を設定したうえで、新規案件を作成してください。
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
