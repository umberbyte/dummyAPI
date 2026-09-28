# dummyAPI - Comprehensive API Stub Server

![Docker Ready](https://img.shields.io/badge/Docker-6080%20Exposed-blue?logo=docker)
![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0.3-green?logo=openapi-initiative)
![Swagger UI](https://img.shields.io/badge/Swagger%20UI-Embedded-85ea2d?logo=swagger)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

外部API連携やWebアプリケーションのテスト・開発・CI/CDで利用できる、オールインワンの**APIモック / スタブサーバー**です。  
MVCモデルのREST API、OAuth 2.0 / OIDC認証認可、SaaS他サービス連携、メッセージング配信、決済APIのスタブを網羅し、Dockerコンテナとしてポート **`6080`** で動作します。

ブラウザでアクセスできる **Swagger UI (`/docs`)** および **内蔵Webダッシュボード＆リクエストインスペクター (`/`)** を標準搭載しています。

---

## 🚀 クイックスタート

### 1. Docker で起動する場合 (推奨)

```bash
# Docker Compose でビルド＆起動
docker compose up --build

# または Docker コマンドで直接実行
docker build -t dummy-api .
docker run -d -p 6080:6080 --name dummy-api-server dummy-api
```

### 2. ローカル (Node.js) で起動する場合

```bash
# 依存関係のインストール
npm install

# サーバー起動 (ポート 6080)
npm start

# 自動テストスイートの実行 (全23テスト)
npm test
```

起動後、ブラウザで以下のURLにアクセスできます。
* 📖 **Swagger UI リファレンス**: [http://localhost:6080/docs](http://localhost:6080/docs)
* 🌐 **Webダッシュボード & インスペクター**: [http://localhost:6080](http://localhost:6080)
* 📄 **OpenAPI 3.0 仕様書 (JSON)**: [http://localhost:6080/openapi.json](http://localhost:6080/openapi.json)

---

## ✨ 主な特長

1. **5大カテゴリ・全46エンドポイントのスタブを網羅**:
   - **MVC REST API**: ユーザー認証、商品・カート・注文、ブログ記事・コメント、タスク管理、S3ファイルアップロード
   - **認証・認可 (Auth / OIDC)**: OAuth 2.0 / OIDC (`/oauth/v2/*`, `/.well-known/*`), WebAuthn/Passkeys, SCIM 2.0, Firebase/Supabase互換
   - **他サービス連携 (Integrations)**: Slack, GitHub REST, Notion, Google Workspace (Calendar/Drive), Salesforce, HubSpot, OpenAI/LLM互換
   - **メッセージング (Messaging)**: SendGrid, Resend, Twilio SMS, LINE Messaging API, FCM プッシュ通知, AWS SQS
   - **決済 (Payments)**: Stripe, PayPal, PayPay (QR/バーコード), PAY.JP, Paidy (後払い), 銀行BaaS (振込・残高照会)
2. **Swagger UI リファレンス (`/docs`)**:
   - OpenAPI 3.0.3 仕様に準拠したインタラクティブなAPIドキュメント。
   - ブラウザから「Try it out」ボタンでその場で直接リクエスト送信・レスポンス確認が可能。
3. **リクエストインスペクター (`/api/_inspector/requests`)**:
   - テスト対象のアプリが送信したHTTPリクエスト（ヘッダー、ボディ、クエリ、IP、時刻）を自動キャプチャ。
   - テスト自動化時に意図したペイロードが届いているか検証可能。
4. **遅延・異常系シミュレーション**:
   - **遅延**: `?sleep=1500` やヘッダー `X-Mock-Delay: 1500` でクライアントのタイムアウト処理を検証。
   - **レート制限**: `?mock_error=rate_limit` で `429 Too Many Requests` を再現。
   - **任意ステータス**: `?mock_status=500` や `?mock_status=503` でエラーハンドリングを検証。
5. **インメモリ状態永続化 & リセット**:
   - 商品の追加、注文の作成、タスクの状態変更などのCRUD操作がメモリ上で維持され、`POST /api/_inspector/reset-db` でいつでも初期シード状態にリセット可能。

---

## 📋 API エンドポイント一覧

### 1. MVC REST API
| Method | Path | 説明 |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | 新規ユーザー登録 (JWT発行) |
| `POST` | `/api/v1/auth/login` | ログイン (トークン発行) |
| `POST` | `/api/v1/auth/logout` | ログアウト |
| `GET` | `/api/v1/users/me` | 自身のプロフィール取得 |
| `PATCH` | `/api/v1/users/me` | プロフィール部分更新 |
| `PUT` | `/api/v1/users/me/password` | パスワード変更 |
| `DELETE`| `/api/v1/users/me` | アカウント退会 (論理削除) |
| `GET` | `/api/v1/users` | ユーザー一覧 (ページネーション対応) |
| `GET` | `/api/v1/users/:id` | ユーザー詳細取得 |
| `PATCH` | `/api/v1/users/:id/role` | ユーザー権限変更 (管理者専用) |
| `GET` | `/api/v1/products` | 商品一覧検索 (カテゴリ・検索フィルタ) |
| `GET` | `/api/v1/products/:id` | 商品詳細取得 |
| `POST` | `/api/v1/products` | 新規商品登録 |
| `PUT` | `/api/v1/products/:id` | 商品情報更新 |
| `DELETE`| `/api/v1/products/:id` | 商品削除 |
| `GET` | `/api/v1/cart` | カート内容・小計取得 |
| `POST` | `/api/v1/cart/items` | カートへ商品追加 |
| `PATCH` | `/api/v1/cart/items/:itemId` | カート内商品の数量変更 |
| `DELETE`| `/api/v1/cart/items/:itemId` | カートから商品削除 |
| `POST` | `/api/v1/orders` | 注文確定 (チェックアウト処理) |
| `GET` | `/api/v1/orders` | 注文履歴一覧 |
| `GET` | `/api/v1/orders/:id` | 注文詳細取得 |
| `POST` | `/api/v1/orders/:id/cancel` | 注文キャンセル |
| `GET` | `/api/v1/posts` | 記事一覧取得 |
| `POST` | `/api/v1/posts` | 記事新規作成 |
| `GET` | `/api/v1/posts/:idOrSlug` | 記事詳細取得 |
| `POST` | `/api/v1/posts/:id/comments` | 記事へコメント投稿 |
| `POST` | `/api/v1/posts/:id/like` | 記事へいいね |
| `GET` | `/api/v1/projects` | プロジェクト一覧 |
| `POST` | `/api/v1/projects/:id/tasks` | プロジェクトへタスク追加 |
| `PATCH` | `/api/v1/tasks/:id/status` | タスクステータス更新 |
| `POST` | `/api/v1/uploads/presigned-url` | S3アップロード用署名付きURL取得 |

### 2. 認証・認可 (Auth / OIDC)
| Method | Path | 説明 |
| :--- | :--- | :--- |
| `GET` | `/.well-known/openid-configuration` | OpenID Connect Discovery 設定 |
| `GET` | `/.well-known/jwks.json` | JSON Web Key Set (JWKS) 公開鍵 |
| `GET` | `/oauth/v2/authorize` | OAuth 2.0 認可エンドポイント |
| `POST` | `/oauth/v2/token` | トークン発行 (Access / ID Token) |
| `GET` | `/oauth/v2/userinfo` | ユーザー属性情報 (UserInfo) |
| `POST` | `/oauth/v2/revoke` | トークン失効 |
| `POST` | `/oauth/v2/introspect` | トークン検証 (RFC 7662) |
| `POST` | `/api/webauthn/register/options`| Passkeys 登録オプション生成 |
| `POST` | `/api/webauthn/register/verify` | Passkeys 登録署名検証 |
| `GET` | `/scim/v2/Users` | SCIM 2.0 ユーザープロビジョニング |
| `POST` | `/identitytoolkit/v3/relyingparty/verifyPassword` | Firebase Auth パスワード認証 |
| `POST` | `/auth/v1/signup` | Supabase Auth サインアップ |

### 3. 他サービス連携 (Integrations)
| Method | Path | 説明 |
| :--- | :--- | :--- |
| `POST` | `/api/slack/chat.postMessage` | Slack メッセージ投稿 |
| `GET` | `/api/slack/conversations.list` | Slack チャンネル一覧 |
| `GET` | `/api/github/user` | GitHub ユーザー情報 |
| `GET` | `/api/github/repos/:owner/:repo/issues` | GitHub Issue一覧 |
| `POST` | `/api/github/repos/:owner/:repo/issues` | GitHub Issue新規作成 |
| `POST` | `/api/notion/v1/pages` | Notion ページ新規作成 |
| `GET` | `/api/google/calendar/events` | Google Calendar イベント取得 |
| `POST` | `/api/salesforce/sobjects/Contact` | Salesforce 連絡先作成 |
| `POST` | `/api/hubspot/crm/v3/objects/contacts` | HubSpot コンタクト作成 |
| `GET` | `/api/weather` | 天気情報取得 |
| `POST` | `/api/deepl/translate` | DeepL 機械翻訳 |
| `POST` | `/v1/chat/completions` | OpenAI / Gemini 互換 LLM チャット生成 |

### 4. メッセージング (Messaging)
| Method | Path | 説明 |
| :--- | :--- | :--- |
| `POST` | `/v3/mail/send` | SendGrid v3 メール送信 (202 Accepted) |
| `POST` | `/api/resend/emails` | Resend メール送信 |
| `POST` | `/2010-04-01/Accounts/:accountSid/Messages.json` | Twilio SMS 送信 |
| `POST` | `/v2/bot/message/push` | LINE Messaging プッシュ配信 |
| `POST` | `/v2/bot/message/reply` | LINE Messaging 返信 |
| `POST` | `/v1/projects/:projectId/messages:send` | Firebase Cloud Messaging (FCM) プッシュ |
| `POST` | `/api/sqs/send-message` | AWS SQS メッセージ送信 |

### 5. 決済 (Payments)
| Method | Path | 説明 |
| :--- | :--- | :--- |
| `POST` | `/v1/payment_intents` | Stripe PaymentIntent 作成 |
| `POST` | `/v1/checkout/sessions` | Stripe Checkout リダイレクトセッション |
| `POST` | `/v1/customers` | Stripe 顧客登録 |
| `POST` | `/v1/refunds` | Stripe 返金処理 |
| `POST` | `/v2/checkout/orders` | PayPal 注文作成 |
| `POST` | `/v2/codes` | PayPay QRコード決済作成 (MPM) |
| `POST` | `/v2/payments` | PayPay バーコード決済 (CPM) |
| `POST` | `/v1/charges` | PAY.JP カード決済作成 |
| `POST` | `/payments/paidy` | Paidy 後払い決済 |
| `GET` | `/api/banking/accounts/balance` | 銀行口座 残高照会 (BaaS) |
| `POST` | `/api/banking/transfers` | 銀行振込 実行依頼 (BaaS) |

### 6. テスト支援・インスペクター
| Method | Path | 説明 |
| :--- | :--- | :--- |
| `GET` | `/api/_inspector/requests` | 直近の受信リクエストログ一覧取得 |
| `DELETE`| `/api/_inspector/requests` | リクエストログの全クリア |
| `POST` | `/api/_inspector/reset-db` | インメモリDBを初期シードデータに復元 |
| `GET` | `/api/_inspector/catalog` | 実装エンドポイントのカタログ取得 |

---

## 🛠️ テスト支援機能の具体的な使用例

### 1. レスポンス遅延シミュレーション (`sleep`)
クライアント側のタイムアウトやリトライ処理を検証できます。
```bash
# 2秒遅延させてレスポンスを返す
curl "http://localhost:6080/api/v1/products?sleep=2000"

# またはヘッダーで指定
curl http://localhost:6080/api/v1/products -H "X-Mock-Delay: 2000"
```

### 2. 異常系・レート制限シミュレーション
```bash
# 429 Too Many Requests (レート制限超過) を再現
curl "http://localhost:6080/api/v1/products?mock_error=rate_limit"

# 任意のHTTPステータスコード (例: 503 Service Unavailable) を再現
curl "http://localhost:6080/api/v1/products?mock_status=503"
```

### 3. リクエストインスペクター (テスト受信ログの照会)
自動テスト実行中に、アプリから送信されたリクエストが正しいかAPI経由で検証できます。
```bash
# 直近のリクエストログ一覧を取得 (最新50件)
curl http://localhost:6080/api/_inspector/requests

# ログをクリア
curl -X DELETE http://localhost:6080/api/_inspector/requests
```

---

## 📂 プロジェクト構成

```
dummyAPI/
├── Dockerfile                  # node:20-alpine ベース、ポート6080公開
├── docker-compose.yml          # ポート 6080:6080 マッピング
├── package.json                # Express, CORS
├── README.md                   # 本ドキュメント
├── .gitignore
├── src/
│   ├── server.js               # サーバー起動 (port 6080)
│   ├── middleware/
│   │   ├── inspector.js        # リクエストログ記録ミドルウェア
│   │   └── simulator.js        # 遅延・エラーシミュレーション
│   ├── store/
│   │   └── memoryDb.js         # インメモリデータストア (CRUD永続化)
│   ├── routes/
│   │   ├── index.js            # ルーター集約
│   │   ├── mvc.js              # 1. MVC REST API
│   │   ├── auth.js             # 2. 認証・認可 API
│   │   ├── integrations.js     # 3. 他サービス連携 API
│   │   ├── messaging.js        # 4. メッセージング API
│   │   ├── payments.js         # 5. 決済 API
│   │   └── inspector.js        # テスト支援・インスペクターAPI
│   ├── docs/
│   │   └── openapi.json        # OpenAPI 3.0.3 完全仕様書
│   └── public/
│       ├── index.html          # Webダッシュボード & APIエクスプローラー
│       ├── docs.html           # 内蔵 Swagger UI ページ
│       ├── style.css           # UIスタイルシート
│       └── app.js              # ダッシュボード制御・ログ自動監視
└── test/
    └── test-suite.js           # 自動結合テストスイート (23テスト)
```

---

## 🔗 リモートリポジトリ

* **GitHub Repository**: [https://github.com/umberbyte/dummyAPI.git](https://github.com/umberbyte/dummyAPI.git)
* **Default Branch**: `main`
