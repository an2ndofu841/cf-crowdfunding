import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const isSupabaseConfigured = hasSupabaseEnv();

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-pink-600">Talent Login</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          タレント / スタッフログイン
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          `Supabase Auth` に接続して、タレント / スタッフの専用ログインとして利用します。
        </p>

        <LoginForm isSupabaseConfigured={isSupabaseConfigured} />

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          {isSupabaseConfigured
            ? "`signInWithPassword` で接続済みです。次段階で招待導線やパスワード再設定を追加できます。"
            : "`.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定するとログインが有効になります。"}
        </div>

        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-slate-500">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  );
}
