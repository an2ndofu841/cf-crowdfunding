"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.email("メールアドレスの形式が不正です。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  isSupabaseConfigured: boolean;
};

export function LoginForm({ isSupabaseConfigured }: LoginFormProps) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!isSupabaseConfigured) {
      setAuthError("Supabase の環境変数が未設定です。");
      return;
    }

    setAuthError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setAuthError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          type="email"
          placeholder="talent@example.com"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          パスワード
        </label>
        <input
          type="password"
          placeholder="********"
          autoComplete="current-password"
          {...register("password")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !isSupabaseConfigured}
        className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>
      {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}
    </form>
  );
}
