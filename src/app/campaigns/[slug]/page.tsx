import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/checkout-form";
import { getPublicCampaignBySlug } from "@/lib/campaigns";
import { formatCurrency } from "@/lib/utils";

type CampaignDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { slug } = await params;
  const campaign = await getPublicCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const progress = Math.min(
    100,
    Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/campaigns" className="text-sm font-medium text-slate-500">
          ← 一覧へ戻る
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-700">
              {campaign.talentName}
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {campaign.title}
            </h1>
            <p className="mt-6 text-base leading-8 text-slate-600">
              {campaign.description}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">現在支援額</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(campaign.raisedAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">目標金額</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatCurrency(campaign.goalAmount)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-sm text-slate-500">終了日</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {campaign.endDate}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-pink-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                達成率 {progress}%
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">リターン一覧</h2>
              <div className="mt-6 space-y-4">
                {campaign.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">
                          {reward.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {reward.description}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-slate-950">
                        {formatCurrency(reward.price)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>
                        {reward.requiresShipping ? "配送あり" : "デジタル特典"}
                      </span>
                      <span>
                        {reward.quantity ? `残数 ${reward.quantity}` : "在庫制限なし"}
                      </span>
                    </div>
                    <div className="mt-5">
                      <CheckoutForm
                        campaignSlug={campaign.slug}
                        rewardId={reward.id}
                        requiresShipping={reward.requiresShipping}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                実装済みの次段階
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>・ `Stripe Checkout` への POST API</li>
                <li>・ `Webhook` 受け口の Route Handler</li>
                <li>・ `Supabase` 接続ユーティリティ</li>
                <li>・ 次段階で RLS と実DB接続に移行可能</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
