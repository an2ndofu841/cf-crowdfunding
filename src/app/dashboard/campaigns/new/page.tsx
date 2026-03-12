import Link from "next/link";
import { redirect } from "next/navigation";

import { CampaignCreateForm } from "@/components/dashboard/campaign-create-form";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "talent") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-medium text-slate-500">
          ← ダッシュボードへ戻る
        </Link>

        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-pink-600">New Campaign</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            新規案件を作成
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            まずは下書きとして案件を作成し、次段階でリターンや活動報告を追加していきます。
          </p>

          <div className="mt-8">
            <CampaignCreateForm />
          </div>
        </div>
      </div>
    </main>
  );
}
