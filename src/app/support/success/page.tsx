import Link from "next/link";

export default function SupportSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">Payment Success</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          支援ありがとうございます
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          本番運用では `Stripe Webhook` を基準に注文確定し、完了メール送信や支援履歴反映を行います。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/campaigns"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            別の案件を見る
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
