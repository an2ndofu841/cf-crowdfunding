# 生誕ライブ向けクラウドファンディングサイト MVP 設計

## 目的
自社所属タレントのみが利用できる、専用クラウドファンディングサイトを構築する。

前提:
- ホスティングは `Vercel`
- BaaS は `Supabase`
- 海外からの決済に対応する
- タレントごとに自分の案件だけ管理できる

## 推奨技術スタック
- フロントエンド: `Next.js (App Router)`
- ホスティング: `Vercel`
- 認証/DB/Storage: `Supabase`
- 決済: `Stripe Checkout`
- メール: `Resend`
- スタイル: `Tailwind CSS`
- フォーム/バリデーション: `React Hook Form` + `Zod`

`Stripe` を採用する理由:
- 海外発行カードへの対応実績が高い
- `Apple Pay` / `Google Pay` を利用しやすい
- Webhook で入金確定を安全に同期できる
- 多通貨対応へ拡張しやすい

## 想定ロール
- `super_admin`: 全体設定、全タレント管理、全案件閲覧
- `staff`: 案件審査、公開制御、活動報告確認、入金確認
- `talent`: 自分の案件作成/編集、活動報告投稿、支援状況確認
- `supporter`: 支援、支援履歴確認

## MVP の画面一覧
### 公開画面
1. トップページ
2. プロジェクト一覧ページ
3. プロジェクト詳細ページ
4. 支援内容確認ページ
5. Stripe Checkout 遷移
6. 支援完了ページ
7. 活動報告一覧/詳細
8. 特商法ページ
9. 利用規約/プライバシーポリシー

### タレント/管理画面
1. ログインページ
2. ダッシュボード
3. 自分のプロジェクト一覧
4. プロジェクト作成/編集
5. リターン作成/編集
6. 活動報告作成
7. 支援状況確認ページ
8. スタッフ審査ページ
9. 管理者向けタレント管理ページ

## MVP で実装する主要機能
- タレントごとのクラファン案件作成
- 目標金額、公開期間、メイン画像、本文、FAQ
- リターン設定
- 自由支援金額
- 支援者のニックネーム、応援メッセージ
- 決済完了後の注文確定
- 進捗表示
- 活動報告投稿
- タレントごとの閲覧制限
- スタッフ承認後に公開

## 対応を後回しにしてよい機能
- 複数言語の本格対応
- 複数通貨の完全最適化
- クーポン
- 抽選リターン
- 在庫の複雑な配送管理
- 定期課金

## 画面ごとの最小要件
### トップページ
- 注目案件一覧
- 新着案件一覧
- タレント別導線
- サイト説明

### プロジェクト詳細ページ
- タイトル
- タレント情報
- メイン画像
- 目標金額
- 現在支援額
- 達成率
- 終了日時
- リターン一覧
- 応援メッセージ一覧
- 活動報告導線

### 支援フロー
1. リターン選択
2. 支援者情報入力
3. Stripe Checkout へ遷移
4. 決済成功
5. Webhook で注文確定
6. 完了メール送信

## DB 設計
### `profiles`
認証ユーザーの基本情報。

主要カラム:
- `id uuid primary key`
- `email text unique`
- `display_name text`
- `role text`
- `created_at timestamptz`

### `talents`
所属タレント情報。

主要カラム:
- `id uuid primary key`
- `profile_id uuid unique`
- `slug text unique`
- `name text`
- `bio text`
- `avatar_url text`
- `is_active boolean`
- `created_at timestamptz`

### `campaigns`
クラファン案件。

主要カラム:
- `id uuid primary key`
- `talent_id uuid`
- `slug text unique`
- `title text`
- `summary text`
- `description text`
- `cover_image_url text`
- `goal_amount integer`
- `currency text default 'JPY'`
- `status text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `published_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

`status` 候補:
- `draft`
- `pending_review`
- `published`
- `closed`
- `archived`

### `campaign_rewards`
リターン情報。

主要カラム:
- `id uuid primary key`
- `campaign_id uuid`
- `title text`
- `description text`
- `price integer`
- `quantity integer null`
- `sort_order integer`
- `is_active boolean`
- `requires_shipping boolean`

### `orders`
注文単位の管理。

主要カラム:
- `id uuid primary key`
- `campaign_id uuid`
- `stripe_checkout_session_id text unique`
- `stripe_payment_intent_id text`
- `supporter_email text`
- `supporter_name text`
- `supporter_nickname text`
- `message text`
- `amount_total integer`
- `currency text`
- `status text`
- `country text`
- `created_at timestamptz`

`status` 候補:
- `pending`
- `paid`
- `failed`
- `refunded`

### `order_items`
注文内のリターン明細。

主要カラム:
- `id uuid primary key`
- `order_id uuid`
- `reward_id uuid null`
- `quantity integer`
- `unit_amount integer`
- `line_amount integer`

### `shipping_addresses`
配送が必要な支援者の住所。

主要カラム:
- `id uuid primary key`
- `order_id uuid unique`
- `country text`
- `postal_code text`
- `state text`
- `city text`
- `address_line1 text`
- `address_line2 text`
- `recipient_name text`

### `campaign_updates`
活動報告。

主要カラム:
- `id uuid primary key`
- `campaign_id uuid`
- `author_profile_id uuid`
- `title text`
- `body text`
- `is_public boolean`
- `published_at timestamptz`

### `staff_approvals`
審査ログ。

主要カラム:
- `id uuid primary key`
- `campaign_id uuid`
- `reviewer_profile_id uuid`
- `status text`
- `comment text`
- `created_at timestamptz`

## RLS の基本方針
- 公開案件は誰でも閲覧可能
- `talent` は自分に紐づく `campaigns` と `campaign_updates` のみ参照/更新可能
- `staff` と `super_admin` は全件参照可能
- `orders` は管理者系のみ原則参照
- 支援者本人の注文確認ページを作る場合のみ、メール認証付きの限定表示にする

## 決済フロー設計
### 採用方式
- `Stripe Checkout`
- サーバー側で Checkout Session を作成
- 成功時は `success_url` へ遷移
- 正式な注文確定は `Stripe Webhook` を正とする

### Webhook で受けるイベント
- `checkout.session.completed`
- `payment_intent.succeeded`
- `charge.refunded`

### 決済時の保存情報
- `campaign_id`
- `reward_id`
- `supporter_nickname`
- `message`
- `country`
- `talent_id`

これらは `metadata` に含め、Webhook で安全に注文作成する。

## 海外決済対応の設計ポイント
- 決済はまず `JPY` で開始
- 海外カード利用を想定し、`Stripe` のカードブランド対応を利用
- 配送ありリターンのみ住所入力を有効化
- フロント文言は将来の英語化を考え、文言定義を分離
- 国情報は `Stripe Checkout` から取得する
- 不正利用対策としてレート制限と bot 対策を入れる

## API / サーバーアクション候補
- `POST /api/checkout`
- `POST /api/stripe/webhook`
- `GET /api/campaigns`
- `GET /api/campaigns/:slug`
- `POST /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`
- `POST /api/admin/updates`

App Router を使う場合は Route Handler で十分対応可能。

## Vercel 環境変数
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`

## 開発ロードマップ
### Phase 1: 初期構築
- Next.js プロジェクト作成
- Tailwind 設定
- Supabase プロジェクト接続
- Stripe 初期設定
- 認証基盤作成

### Phase 2: 基本データモデル
- Supabase テーブル作成
- RLS 設定
- シードデータ投入
- タレント/スタッフの権限確認

### Phase 3: 公開サイト
- トップページ
- 案件一覧
- 案件詳細
- リターン表示
- 活動報告表示

### Phase 4: 決済
- Checkout Session 作成
- 成功/キャンセル画面
- Webhook 連携
- 注文保存
- 完了メール送信

### Phase 5: 管理画面
- タレントログイン
- 案件作成/編集
- リターン管理
- 活動報告投稿
- スタッフ承認

### Phase 6: 運用前整備
- 特商法/規約ページ
- エラーハンドリング
- ログ整備
- 監視設定
- 最低限の E2E テスト

## 実装優先順位
1. 認証とロール
2. タレント/案件/リターンの DB
3. 公開ページ
4. Checkout
5. Webhook
6. 管理画面
7. 活動報告
8. メールと法務ページ

## 初期ディレクトリ構成案
```text
src/
  app/
    (public)/
    (auth)/
    dashboard/
    api/
  components/
  features/
    campaigns/
    checkout/
    dashboard/
  lib/
    supabase/
    stripe/
    auth/
  types/
supabase/
  migrations/
```

## リスクと注意点
- 海外決済対応と配送対応を同時に始めると入力項目が増えて離脱しやすい
- リターン設計が複雑だと管理画面の実装コストが上がる
- 注文確定は必ず Webhook 基準にする
- `service_role` はサーバー側でのみ使用する

## 次に着手する内容
次の着手として最も自然なのは以下の順:
1. `Next.js` プロジェクト雛形の作成
2. `Supabase` スキーマと migration 作成
3. `Stripe Checkout` の最小導線実装
4. タレント用ダッシュボードの骨組み作成
