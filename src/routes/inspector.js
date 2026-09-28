import express from "express";
import { requestHistory, clearRequestHistory } from "../middleware/inspector.js";
import { resetDb } from "../store/memoryDb.js";

const router = express.Router();

// Get captured request logs
router.get("/requests", (req, res) => {
  const limit = parseInt(req.query.limit || "50", 10);
  res.json({
    total: requestHistory.length,
    requests: requestHistory.slice(0, limit)
  });
});

// Clear captured request logs
router.delete("/requests", (req, res) => {
  clearRequestHistory();
  res.json({ message: "Request history cleared", total: 0 });
});

// Reset in-memory database to initial mock state
router.post("/reset-db", (req, res) => {
  resetDb();
  res.json({ message: "Database reset to initial seed state" });
});

// Catalog of all available stub endpoints
router.get("/catalog", (req, res) => {
  const catalog = [
    {
      category: "1. MVC REST API",
      items: [
        { method: "POST", path: "/api/v1/auth/register", description: "User registration" },
        { method: "POST", path: "/api/v1/auth/login", description: "User login (returns JWT)" },
        { method: "GET", path: "/api/v1/users/me", description: "Current user profile" },
        { method: "GET", path: "/api/v1/products", description: "List products (filterable)" },
        { method: "POST", path: "/api/v1/products", description: "Create product" },
        { method: "GET", path: "/api/v1/cart", description: "Get cart contents" },
        { method: "POST", path: "/api/v1/cart/items", description: "Add item to cart" },
        { method: "POST", path: "/api/v1/orders", description: "Checkout / Create order" },
        { method: "GET", path: "/api/v1/posts", description: "List blog posts" },
        { method: "POST", path: "/api/v1/posts/:id/like", description: "Like a post" },
        { method: "GET", path: "/api/v1/projects", description: "List projects" },
        { method: "POST", path: "/api/v1/uploads/presigned-url", description: "S3 Presigned URL" }
      ]
    },
    {
      category: "2. 認証・認可 (Auth / OIDC)",
      items: [
        { method: "GET", path: "/.well-known/openid-configuration", description: "OIDC Discovery document" },
        { method: "GET", path: "/.well-known/jwks.json", description: "JSON Web Key Set (JWKS)" },
        { method: "GET", path: "/oauth/v2/authorize", description: "OAuth 2.0 Authorization endpoint" },
        { method: "POST", path: "/oauth/v2/token", description: "OAuth 2.0 Token exchange" },
        { method: "GET", path: "/oauth/v2/userinfo", description: "OIDC UserInfo" },
        { method: "POST", path: "/api/webauthn/register/options", description: "Passkeys registration options" },
        { method: "GET", path: "/scim/v2/Users", description: "SCIM 2.0 User provisioning" },
        { method: "POST", path: "/identitytoolkit/v3/relyingparty/verifyPassword", description: "Firebase Auth verify" }
      ]
    },
    {
      category: "3. 他サービス連携 (Integrations)",
      items: [
        { method: "POST", path: "/api/slack/chat.postMessage", description: "Slack Post Message" },
        { method: "GET", path: "/api/slack/conversations.list", description: "Slack Channels" },
        { method: "GET", path: "/api/github/user", description: "GitHub User Info" },
        { method: "POST", path: "/api/github/repos/:owner/:repo/issues", description: "GitHub Create Issue" },
        { method: "POST", path: "/api/notion/v1/pages", description: "Notion Create Page" },
        { method: "GET", path: "/api/google/calendar/events", description: "Google Calendar Events" },
        { method: "POST", path: "/api/salesforce/sobjects/Contact", description: "Salesforce Create Contact" },
        { method: "POST", path: "/v1/chat/completions", description: "OpenAI / Gemini LLM Chat Completions" }
      ]
    },
    {
      category: "4. メッセージング (Messaging)",
      items: [
        { method: "POST", path: "/v3/mail/send", description: "SendGrid v3 Email send" },
        { method: "POST", path: "/api/resend/emails", description: "Resend Email API" },
        { method: "POST", path: "/2010-04-01/Accounts/:accountSid/Messages.json", description: "Twilio SMS API" },
        { method: "POST", path: "/v2/bot/message/push", description: "LINE Messaging Push" },
        { method: "POST", path: "/v1/projects/:projectId/messages:send", description: "FCM Push Notification" },
        { method: "POST", path: "/api/sqs/send-message", description: "AWS SQS Send Message" }
      ]
    },
    {
      category: "5. 決済 (Payments)",
      items: [
        { method: "POST", path: "/v1/payment_intents", description: "Stripe Create PaymentIntent" },
        { method: "POST", path: "/v1/checkout/sessions", description: "Stripe Checkout Session" },
        { method: "POST", path: "/v1/refunds", description: "Stripe Refund" },
        { method: "POST", path: "/v2/checkout/orders", description: "PayPal Create Order" },
        { method: "POST", path: "/v2/codes", description: "PayPay QR Code Payment" },
        { method: "POST", path: "/v1/charges", description: "PAY.JP Card Charge" },
        { method: "POST", path: "/payments/paidy", description: "Paidy BNPL Payment" },
        { method: "GET", path: "/api/banking/accounts/balance", description: "Bank Account Balance" },
        { method: "POST", path: "/api/banking/transfers", description: "Bank Wire Transfer" }
      ]
    }
  ];
  res.json({ catalog });
});

export default router;
