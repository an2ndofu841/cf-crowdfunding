"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { SupportCheckoutInput } from "@/types/domain";

const supportCheckoutSchema = z.object({
  supporterName: z.string().trim().min(1, "お名前を入力してください。"),
  supporterNickname: z.string().trim().min(1, "ニックネームを入力してください。"),
  supporterEmail: z.email("メールアドレスの形式が不正です。"),
  supporterPhone: z.string().trim().optional(),
  address: z
    .object({
      country: z.string().trim().min(1, "国 / 地域を入力してください。"),
      postalCode: z.string().trim().min(1, "郵便番号を入力してください。"),
      state: z.string().trim().min(1, "都道府県 / 州を入力してください。"),
      city: z.string().trim().min(1, "市区町村を入力してください。"),
      addressLine1: z.string().trim().min(1, "住所1を入力してください。"),
      addressLine2: z.string().trim().optional(),
    })
    .optional(),
});

type SupportCheckoutFormValues = z.infer<typeof supportCheckoutSchema>;

type CheckoutFormProps = {
  campaignSlug: string;
  rewardId: string;
  requiresShipping: boolean;
};

export function CheckoutForm({
  campaignSlug,
  rewardId,
  requiresShipping,
}: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupportCheckoutFormValues>({
    resolver: zodResolver(supportCheckoutSchema),
    defaultValues: {
      supporterName: "",
      supporterNickname: "",
      supporterEmail: "",
      supporterPhone: "",
      address: requiresShipping
        ? {
            country: "Japan",
            postalCode: "",
            state: "",
            city: "",
            addressLine1: "",
            addressLine2: "",
          }
        : undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setErrorMessage(null);

    const payload: SupportCheckoutInput = {
      campaignSlug,
      rewardId,
      supporterName: values.supporterName,
      supporterNickname: values.supporterNickname,
      supporterEmail: values.supporterEmail,
      supporterPhone: values.supporterPhone?.trim() || undefined,
      address: requiresShipping
        ? {
            country: values.address?.country ?? "",
            postalCode: values.address?.postalCode ?? "",
            state: values.address?.state ?? "",
            city: values.address?.city ?? "",
            addressLine1: values.address?.addressLine1 ?? "",
            addressLine2: values.address?.addressLine2 || undefined,
          }
        : undefined,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "決済画面の作成に失敗しました。");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "予期しないエラーが発生しました。",
      );
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
        会員登録なしで支援できます。入力後、そのまま `Stripe Checkout` に進みます。
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          お名前
        </label>
        <input
          type="text"
          {...register("supporterName")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="山田 花子"
        />
        {errors.supporterName ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.supporterName.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          ニックネーム
        </label>
        <input
          type="text"
          {...register("supporterNickname")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="はなちゃん"
        />
        {errors.supporterNickname ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.supporterNickname.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          type="email"
          {...register("supporterEmail")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="supporter@example.com"
        />
        {errors.supporterEmail ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.supporterEmail.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          電話番号
          <span className="ml-2 text-xs text-slate-500">任意</span>
        </label>
        <input
          type="tel"
          {...register("supporterPhone")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          placeholder="090-1234-5678"
        />
      </div>

      {requiresShipping ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">返礼品発送先住所</p>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              配送が必要な返礼品のため、住所入力が必須です。
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              国 / 地域
            </label>
            <input
              type="text"
              {...register("address.country")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Japan"
            />
            {errors.address?.country ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.address.country.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                郵便番号
              </label>
              <input
                type="text"
                {...register("address.postalCode")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="150-0001"
              />
              {errors.address?.postalCode ? (
                <p className="mt-2 text-sm text-rose-600">
                  {errors.address.postalCode.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                都道府県 / 州
              </label>
              <input
                type="text"
                {...register("address.state")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="東京都"
              />
              {errors.address?.state ? (
                <p className="mt-2 text-sm text-rose-600">
                  {errors.address.state.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              市区町村
            </label>
            <input
              type="text"
              {...register("address.city")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="渋谷区"
            />
            {errors.address?.city ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.address.city.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              住所1
            </label>
            <input
              type="text"
              {...register("address.addressLine1")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="神宮前1-2-3"
            />
            {errors.address?.addressLine1 ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.address.addressLine1.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              住所2
              <span className="ml-2 text-xs text-slate-500">任意</span>
            </label>
            <input
              type="text"
              {...register("address.addressLine2")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="マンション名・部屋番号"
            />
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Checkout を作成中..." : "入力内容を確認して支援する"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-rose-600">{errorMessage}</p>
      ) : null}
    </form>
  );
}
