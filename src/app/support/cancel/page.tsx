import Link from "next/link";

export default function SupportCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-amber-600">Payment Cancelled</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          決済はまだ完了していません
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          再度支援する場合は、案件詳細ページから改めて `Stripe Checkout` に進んでください。
        </p>
        <div className="mt-8">
          <Link
            href="/campaigns"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            案件一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
