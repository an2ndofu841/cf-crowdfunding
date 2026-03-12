import Link from "next/link";

import { getPublicCampaigns } from "@/lib/campaigns";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await getPublicCampaigns();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-pink-600">Campaigns</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              公開中の生誕ライブ案件
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              `Supabase` が設定済みなら実データ、未設定ならモックデータを表示します。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900"
          >
            トップへ戻る
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {campaigns.map((campaign) => {
            const progress = Math.min(
              100,
              Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
            );

            return (
              <article
                key={campaign.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-700">
                    {campaign.talentName}
                  </span>
                  <span className="text-sm text-slate-500">
                    終了 {campaign.endDate}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                  {campaign.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
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
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {formatCurrency(campaign.raisedAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">目標金額</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatCurrency(campaign.goalAmount)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  案件詳細を見る
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
