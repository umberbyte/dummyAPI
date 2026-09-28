# dummyAPI - Comprehensive API Stub Server

テスト・開発用のオールインワンAPIモック/スタブサーバーです。
MVCモデルのREST API、OAuth/OIDC認証認可、SaaS他サービス連携、メッセージング配信、各種決済APIのスタブを網羅しており、Dockerコンテナとしてポート `6080` で動作します。

ブラウザでアクセスできる **内蔵Webダッシュボード（APIエクスプローラー ＆ リクエストインスペクター）** も備えています。

---

## 主な特長

1. **全カテゴリのAPIスタブを網羅**:
   - **MVC REST API**: ユーザー認証、商品・カート・注文、記事・コメント、タスク管理、ファイルアップロード
   - **認証・認可**: OAuth 2.0 / OIDC (`/oauth/v2/*`, `/.well-known/*`), WebAuthn/Passkeys, SCIM 2.0, Firebase/Supabase互換
   - **他サービス連携**: Slack, GitHub REST, Notion, Google Workspace, Salesforce, HubSpot, OpenAI/LLM互換
   - **メッセージング**: SendGrid, Resend, Twilio SMS, LINE Messaging API, FCM プッシュ通知, AWS SQS
   - **決済**: Stripe, PayPal, PayPay (QR/バーコード), PAY.JP, Paidy (後払い), 銀行BaaS (振込・残高照会)
2. **内蔵Webダッシュボード (`http://localhost:6080`)**:
   - 全エンドポイントの仕様確認
   - ブラウザから直接テストリクエスト送信＆レスポンス確認
   - サーバーが受信したリクエスト履歴（メソッド、ヘッダー、ボディ）をリアルタイム監視
3. **テスト支援機能**:
   - **遅延シミュレーション**: `?sleep=1000` または `X-Mock-Delay: 1000` でタイムアウト試験が可能
   - **エラーシミュレーション**: `?mock_status=500` や `?mock_error=rate_limit` で異常系ハンドリング試験が可能
   - **リクエストインスペクター**: `GET /api/_inspector/requests` でクライアントが意図したリクエストを送れているか検証可能
   - **DB状態リセット**: `POST /api/_inspector/reset-db` でインメモリデータを初期状態に復元

---

## 起動方法

### 1. Docker で起動する場合 (推奨)

Dockerがインストールされている環境では、以下のいずれかで起動できます。

```bash
# Docker Compose でビルド＆起動
docker compose up --build

# または Docker コマンド直接実行
docker build -t dummy-api .
docker run -d -p 6080:6080 --name dummy-api-server dummy-api
```

起動後、ブラウザで **`http://localhost:6080`** にアクセスするとWebダッシュボードが開きます。

### 2. ローカル (Node.js) で起動する場合

```bash
# 依存ライブラリのインストール
npm install

# サーバー起動 (ポート 6080)
npm start

# 開発用ホットリロード起動
npm run dev

# 自動テストスイートの実行
npm test
```

---

## API エンドポイント一覧と利用例 (curl)

### 1. MVC REST API
```bash
# ユーザー登録
curl -X POST http://localhost:6080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Yamada Taro", "email": "taro@example.com"}'

# 商品一覧取得
curl http://localhost:6080/api/v1/products

# カートへ商品追加
curl -X POST http://localhost:6080/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_101", "quantity": 2}'

# 注文確定 (Checkout)
curl -X POST http://localhost:6080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": "usr_1"}'
```

### 2. 認証・認可 (OAuth 2.0 / OIDC / Passkeys)
```bash
# OIDC Discovery 設定取得
curl http://localhost:6080/.well-known/openid-configuration

# OAuth トークン取得
curl -X POST http://localhost:6080/oauth/v2/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type": "authorization_code", "code": "sample_auth_code"}'

# ユーザー情報取得
curl http://localhost:6080/oauth/v2/userinfo \
  -H "Authorization: Bearer dummy_token"

# Passkeys (WebAuthn) 登録オプション
curl -X POST http://localhost:6080/api/webauthn/register/options
```

### 3. 他サービス連携
```bash
# Slack メッセージ投稿
curl -X POST http://localhost:6080/api/slack/chat.postMessage \
  -H "Content-Type: application/json" \
  -d '{"channel": "C12345", "text": "テスト通知です"}'

# GitHub Issue作成
curl -X POST http://localhost:6080/api/github/repos/umberbyte/dummyAPI/issues \
  -H "Content-Type: application/json" \
  -d '{"title": "バグ報告: 接続エラー"}'

# LLM チャット補完 (OpenAI / Gemini 互換)
curl -X POST http://localhost:6080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "スタブAPIのテスト"}]}'
```

### 4. メッセージング
```bash
# SendGrid メール送信
curl -X POST http://localhost:6080/v3/mail/send \
  -H "Content-Type: application/json" \
  -d '{"personalizations": [{"to": [{"email": "user@example.com"}]}], "subject": "認証コード"}'

# Twilio SMS 送信
curl -X POST http://localhost:6080/2010-04-01/Accounts/AC12345/Messages.json \
  -H "Content-Type: application/json" \
  -d '{"To": "+819012345678", "Body": "ワンタイムパスワード: 987654"}'

# LINE Messaging プッシュ通知
curl -X POST http://localhost:6080/v2/bot/message/push \
  -H "Content-Type: application/json" \
  -d '{"to": "U1234567", "messages": [{"type": "text", "text": "注文が完了しました"}]}'
```

### 5. 決済
```bash
# Stripe PaymentIntent 作成
curl -X POST http://localhost:6080/v1/payment_intents \
  -H "Content-Type: application/json" \
  -d '{"amount": 3500, "currency": "jpy"}'

# Stripe Checkout Session 作成
curl -X POST http://localhost:6080/v1/checkout/sessions \
  -H "Content-Type: application/json" \
  -d '{"success_url": "https://example.com/success"}'

# PayPay QRコード決済作成
curl -X POST http://localhost:6080/v2/codes \
  -H "Content-Type: application/json" \
  -d '{"amount": {"amount": 1200, "currency": "JPY"}}'

# 銀行 振込実行 (BaaS)
curl -X POST http://localhost:6080/api/banking/transfers \
  -H "Content-Type: application/json" \
  -d '{"transferAmount": 50000, "beneficiaryBankCode": "0001"}'
```

---

## テスト支援機能の利用方法

### レスポンス遅延シミュレーション (`sleep`)
クライアントのタイムアウト処理をテストできます。
```bash
# 2秒遅延させてレスポンスを返す
curl "http://localhost:6080/api/v1/products?sleep=2000"
```

### 異常系・レート制限シミュレーション
```bash
# 429 Too Many Requests を意図的に再現
curl "http://localhost:6080/api/v1/products?mock_error=rate_limit"

# 任意のHTTPステータスコード (例: 503 Service Unavailable) を再現
curl "http://localhost:6080/api/v1/products?mock_status=503"
```

### リクエストインスペクター (テスト受信ログの照会)
自動テスト実行中、アプリから意図したパラメータが届いているか検証できます。
```bash
# 受信した直近のリクエストログ一覧を取得
curl http://localhost:6080/api/_inspector/requests

# ログをクリア
curl -X DELETE http://localhost:6080/api/_inspector/requests

# DB状態を初期シードデータに復元
curl -X POST http://localhost:6080/api/_inspector/reset-db
```

---

## リポジトリ情報

* **Remote URL**: `https://github.com/umberbyte/dummyAPI.git`
