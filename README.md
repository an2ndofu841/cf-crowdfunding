## CF Crowdfunding

生誕ライブ向けの、所属タレント専用クラウドファンディングサイトの初期雛形です。

技術構成:
- `Next.js (App Router)`
- `Vercel`
- `Supabase`
- `Stripe Checkout`

## Getting Started

1. 依存関係をインストール
2. `.env.example` を元に `.env.local` を作成
3. `Supabase` と `Stripe` のキーを設定
4. 開発サーバーを起動

```bash
npm install
cp .env.example .env.local
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 実装済みの土台

- 公開トップページ
- 案件一覧ページ
- 案件詳細ページ
- 会員登録なしで使えるゲスト支援フォーム
- `Supabase Auth` に接続するログイン画面
- ログイン保護つきダッシュボード
- ログアウトボタン
- セッション反映用 `middleware`
- `POST /api/checkout`
- `POST /api/stripe/webhook`
- `Supabase` 接続ユーティリティ
- 初回 migration

## 環境変数

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
```

## Supabase

初回スキーマは `supabase/migrations/0001_initial_schema.sql` にあります。

主なテーブル:
- `profiles`
- `talents`
- `campaigns`
- `campaign_rewards`
- `orders`
- `order_items`
- `shipping_addresses`
- `campaign_updates`
- `staff_approvals`

認証まわり:
- `auth.users` 作成時に `profiles` を自動生成
- `profiles.role` で `super_admin / staff / talent / supporter` を管理
- `dashboard` はログイン必須
- 支援者は会員登録なしで支援可能

## Stripe

初期段階では、支援前にゲストフォームで以下を入力してから `Stripe Checkout` に進む構成です。

- 名前
- ニックネーム
- メールアドレス
- 電話番号（任意）
- 住所（配送あり返礼品のみ必須）

本番運用では以下を進めてください。

- `Supabase` 上の案件 / リターンを参照して Checkout を生成する
- `Webhook` で注文確定する
- 完了メール送信を追加する
- 海外配送が必要なリターンだけ住所回収を有効化する

## ドキュメント

- 設計メモ: `docs/crowdfunding-mvp-plan.md`

## Next Steps

1. `Supabase Auth` のログイン接続
2. 案件 CRUD
3. リターン管理
4. `Webhook` での注文保存
5. スタッフ承認フロー
