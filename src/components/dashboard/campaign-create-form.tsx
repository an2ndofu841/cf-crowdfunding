"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createCampaignAction,
  initialCreateCampaignActionState,
} from "@/app/dashboard/campaigns/new/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "作成中..." : "下書きとして作成"}
    </button>
  );
}

export function CampaignCreateForm() {
  const [state, formAction] = useActionState(
    createCampaignAction,
    initialCreateCampaignActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          案件タイトル
        </label>
        <input
          type="text"
          name="title"
          placeholder="綾花 生誕ライブ 2026 応援プロジェクト"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          スラッグ
        </label>
        <input
          type="text"
          name="slug"
          placeholder="ayaka-birthday-live-2026"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
        <p className="mt-2 text-xs leading-6 text-slate-500">
          URL に使います。半角英数字とハイフンを推奨します。
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          概要
        </label>
        <textarea
          name="summary"
          rows={3}
          placeholder="演出強化、特典制作、会場装飾のための支援募集"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          詳細説明
        </label>
        <textarea
          name="description"
          rows={6}
          placeholder="このプロジェクトで実現したい内容を詳しく記載してください。"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            目標金額
          </label>
          <input
            type="number"
            name="goalAmount"
            min="1000"
            step="1000"
            placeholder="2000000"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            終了日
          </label>
          <input
            type="date"
            name="endDate"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            required
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
