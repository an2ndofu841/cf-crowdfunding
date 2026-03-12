import Link from "next/link";

import { getPublicCampaigns } from "@/lib/campaigns";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const campaigns = (await getPublicCampaigns()).slice(0, 2);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7fb,_#f7f7fb_50%,_#eef2ff)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-600">
              CF Crowdfunding
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              所属タレント専用 生誕ライブ支援プラットフォーム
            </h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/campaigns"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              案件一覧
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              ログイン
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-sm font-medium text-pink-700">
              Vercel + Supabase + Stripe
            </span>
            <h2 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
              海外からも支援できる、生誕ライブ特化型クラウドファンディング。
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              所属タレントだけが自分の案件を管理でき、スタッフ承認を通した上で公開できる専用サイトの初期雛形です。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/campaigns"
                className="rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700"
              >
                公開案件を見る
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                タレント管理画面へ
              </Link>
            </div>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <dt className="text-sm text-slate-500">決済</dt>
                <dd className="mt-2 text-lg font-semibold">Stripe Checkout</dd>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <dt className="text-sm text-slate-500">認証 / DB</dt>
                <dd className="mt-2 text-lg font-semibold">Supabase Auth + RLS</dd>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <dt className="text-sm text-slate-500">運用</dt>
                <dd className="mt-2 text-lg font-semibold">Vercel デプロイ</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200 backdrop-blur">
            <p className="text-sm font-semibold text-slate-500">スタッフ確認用サマリー</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">公開中プロジェクト</p>
                <p className="mt-2 text-3xl font-semibold">2件</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">申請待ち</p>
                  <p className="mt-2 text-2xl font-semibold">3件</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">今月支援総額</p>
                  <p className="mt-2 text-2xl font-semibold">¥2.14M</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-500">
                `Supabase` が設定済みなら実データ、未設定ならモック表示に自動で切り替わります。
              </p>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-pink-600">Featured Campaigns</p>
              <h3 className="mt-2 text-2xl font-semibold">注目案件</h3>
            </div>
            <Link href="/campaigns" className="text-sm font-medium text-slate-600">
              すべて見る
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {campaigns.map((campaign) => {
              const progress = Math.min(
                100,
                Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
              );

              return (
                <article
                  key={campaign.slug}
                  className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-lg shadow-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-700">
                      {campaign.talentName}
                    </span>
                    <span className="text-sm text-slate-500">終了 {campaign.endDate}</span>
                  </div>
                  <h4 className="mt-4 text-xl font-semibold">{campaign.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {campaign.summary}
                  </p>
                  <div className="mt-6 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-pink-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-500">現在支援額</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {formatCurrency(campaign.raisedAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">達成率</p>
                      <p className="mt-1 text-lg font-semibold">{progress}%</p>
                    </div>
                  </div>
                  <Link
                    href={`/campaigns/${campaign.slug}`}
                    className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    詳細を見る
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
