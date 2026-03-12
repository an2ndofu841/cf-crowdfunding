"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateCampaignActionState = {
  error: string | null;
};

export const initialCreateCampaignActionState: CreateCampaignActionState = {
  error: null,
};

function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCampaignAction(
  _prevState: CreateCampaignActionState,
  formData: FormData,
): Promise<CreateCampaignActionState> {
  if (!hasSupabaseEnv()) {
    return {
      error: "Supabase の環境変数が未設定です。",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const goalAmount = Number(formData.get("goalAmount") ?? 0);
  const endDate = String(formData.get("endDate") ?? "").trim();

  if (!title || !slugInput || !summary || !description || !goalAmount || !endDate) {
    return {
      error: "すべての必須項目を入力してください。",
    };
  }

  if (goalAmount < 1000) {
    return {
      error: "目標金額は 1,000 円以上で入力してください。",
    };
  }

  const slug = normalizeSlug(slugInput);

  if (!slug) {
    return {
      error: "スラッグは半角英数字とハイフンで入力してください。",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "ログインが必要です。",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "talent") {
    return {
      error: "案件作成は talent ロールのユーザーのみ実行できます。",
    };
  }

  const { data: talent } = await supabase
    .from("talents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!talent) {
    return {
      error: "`talents` テーブルにログインユーザーの紐付けがありません。",
    };
  }

  const { error } = await supabase.from("campaigns").insert({
    talent_id: talent.id,
    slug,
    title,
    summary,
    description,
    goal_amount: goalAmount,
    currency: "JPY",
    status: "draft",
    ends_at: new Date(endDate).toISOString(),
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "同じスラッグの案件がすでに存在します。"
          : "案件の作成に失敗しました。",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
  redirect("/dashboard");
}
