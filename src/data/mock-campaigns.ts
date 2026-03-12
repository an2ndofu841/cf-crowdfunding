import type { Campaign } from "@/types/domain";

export const mockCampaigns: Campaign[] = [
  {
    id: "camp_ayaka_2026",
    slug: "ayaka-birthday-live-2026",
    talentName: "綾花",
    title: "綾花 生誕ライブ 2026 応援プロジェクト",
    summary: "演出強化、フラワースタンド、来場特典制作のための支援募集。",
    description:
      "綾花の生誕ライブをより特別な一日にするため、ステージ演出と来場者特典の制作費を募るプロジェクトです。海外のファンも支援しやすいよう、Stripe Checkout を利用した専用サイトとして運用します。",
    raisedAmount: 1280000,
    goalAmount: 2000000,
    endDate: "2026-05-20",
    status: "published",
    rewards: [
      {
        id: "reward_ayaka_1",
        title: "お礼メッセージ",
        description: "限定画像付きのお礼メッセージを送付します。",
        price: 3000,
        requiresShipping: false,
      },
      {
        id: "reward_ayaka_2",
        title: "限定アクリルキーホルダー",
        description: "生誕衣装ビジュアルの限定グッズ。",
        price: 10000,
        quantity: 150,
        requiresShipping: true,
      },
    ],
  },
  {
    id: "camp_rin_2026",
    slug: "rin-birthday-stage-2026",
    talentName: "凛",
    title: "凛 生誕ステージ制作プロジェクト",
    summary: "映像演出と会場装飾を中心にアップグレードする案件。",
    description:
      "凛の生誕ステージを強化するためのクラウドファンディングです。初期雛形では、一覧表示、詳細表示、チェックアウト遷移のモック動線を確認できます。",
    raisedAmount: 860000,
    goalAmount: 1500000,
    endDate: "2026-06-01",
    status: "published",
    rewards: [
      {
        id: "reward_rin_1",
        title: "デジタルフォトセット",
        description: "支援者限定フォトを配布します。",
        price: 5000,
        requiresShipping: false,
      },
      {
        id: "reward_rin_2",
        title: "直筆サイン入りポストカード",
        description: "枚数限定の発送リターンです。",
        price: 12000,
        quantity: 80,
        requiresShipping: true,
      },
    ],
  },
];

export function getCampaignBySlug(slug: string) {
  return mockCampaigns.find((campaign) => campaign.slug === slug);
}
