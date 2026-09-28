import http from "http";
import app from "../src/server.js";

// Helper to make local requests against the test server instance
function runTests() {
  const TEST_PORT = 6081;
  const server = http.createServer(app);

  server.listen(TEST_PORT, async () => {
    console.log(`\n🧪 Starting test suite on http://localhost:${TEST_PORT} ...\n`);
    let passed = 0;
    let failed = 0;

    const assert = (condition, name) => {
      if (condition) {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${name}`);
        failed++;
      }
    };

    const request = async (method, path, body = null, headers = {}) => {
      const opts = {
        method,
        headers: { "Content-Type": "application/json", ...headers }
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`http://localhost:${TEST_PORT}${path}`, opts);
      const data = await res.json().catch(() => null);
      return { status: res.status, data, headers: res.headers };
    };

    try {
      // 1. Inspector Catalog & Clear
      const catRes = await request("GET", "/api/_inspector/catalog");
      assert(catRes.status === 200 && catRes.data.catalog.length >= 5, "Inspector Catalog returns 5 categories");

      await request("DELETE", "/api/_inspector/requests");

      // 2. Category 1: MVC REST API
      const regRes = await request("POST", "/api/v1/auth/register", { name: "Test User", email: "test@example.com" });
      assert(regRes.status === 201 && regRes.data.user.email === "test@example.com", "MVC: User Registration");

      const prodsRes = await request("GET", "/api/v1/products");
      assert(prodsRes.status === 200 && Array.isArray(prodsRes.data.products), "MVC: Get Products");

      const cartRes = await request("POST", "/api/v1/cart/items", { productId: "prod_101", quantity: 2 });
      assert(cartRes.status === 201 && cartRes.data.quantity === 2, "MVC: Add to Cart");

      const orderRes = await request("POST", "/api/v1/orders", { totalAmount: 188000 });
      assert(orderRes.status === 201 && orderRes.data.status === "processing", "MVC: Create Order");

      // 3. Category 2: Auth & OIDC
      const oidcRes = await request("GET", "/.well-known/openid-configuration");
      assert(oidcRes.status === 200 && oidcRes.data.token_endpoint.includes("/oauth/v2/token"), "Auth: OIDC Discovery");

      const tokenRes = await request("POST", "/oauth/v2/token", { grant_type: "authorization_code", code: "abc" });
      assert(tokenRes.status === 200 && !!tokenRes.data.access_token, "Auth: OAuth 2.0 Token");

      const passkeyRes = await request("POST", "/api/webauthn/register/options");
      assert(passkeyRes.status === 200 && !!passkeyRes.data.challenge, "Auth: Passkeys Options");

      // 4. Category 3: Integrations
      const slackRes = await request("POST", "/api/slack/chat.postMessage", { channel: "general", text: "Hi" });
      assert(slackRes.status === 200 && slackRes.data.ok === true, "Integrations: Slack Post Message");

      const ghRes = await request("POST", "/api/github/repos/umberbyte/dummyAPI/issues", { title: "Test issue" });
      assert(ghRes.status === 201 && ghRes.data.title === "Test issue", "Integrations: GitHub Issue Creation");

      const llmRes = await request("POST", "/v1/chat/completions", { messages: [{ role: "user", content: "ping" }] });
      assert(llmRes.status === 200 && llmRes.data.choices[0].message.content.includes("Mock response"), "Integrations: LLM Completion");

      // 5. Category 4: Messaging
      const sgRes = await request("POST", "/v3/mail/send", { subject: "Verify" });
      assert(sgRes.status === 202 && !!sgRes.data.messageId, "Messaging: SendGrid Email Send (202)");

      const twilioRes = await request("POST", "/2010-04-01/Accounts/AC_mock/Messages.json", { To: "+819000000000", Body: "OTP" });
      assert(twilioRes.status === 201 && twilioRes.data.status === "queued", "Messaging: Twilio SMS Send");

      const lineRes = await request("POST", "/v2/bot/message/push", { to: "U123", messages: [] });
      assert(lineRes.status === 200 && Array.isArray(lineRes.data.sentMessages), "Messaging: LINE Push");

      // 6. Category 5: Payments
      const stripeRes = await request("POST", "/v1/payment_intents", { amount: 5000, currency: "jpy" });
      assert(stripeRes.status === 200 && stripeRes.data.id.startsWith("pi_"), "Payments: Stripe PaymentIntent");

      const paypayRes = await request("POST", "/v2/codes", { amount: { amount: 1000, currency: "JPY" } });
      assert(paypayRes.status === 201 && paypayRes.data.resultInfo.code === "SUCCESS", "Payments: PayPay Code");

      const bankRes = await request("GET", "/api/banking/accounts/balance");
      assert(bankRes.status === 200 && bankRes.data.balance > 0, "Payments: Bank Account Balance");

      // 7. Testing Utilities: Error & Latency Simulation
      const rateLimitRes = await request("GET", "/api/v1/products?mock_error=rate_limit");
      assert(rateLimitRes.status === 429 && rateLimitRes.data.error.code === "RATE_LIMIT_EXCEEDED", "Simulation: Rate Limit 429");

      const status503Res = await request("GET", "/api/v1/products?mock_status=503");
      assert(status503Res.status === 503 && status503Res.data.error.code === "MOCK_503", "Simulation: Status 503");

      const start = Date.now();
      await request("GET", "/api/v1/products?sleep=300");
      const elapsed = Date.now() - start;
      assert(elapsed >= 250, `Simulation: Latency sleep parameter (${elapsed}ms >= 250ms)`);

      // 8. Inspector Logs Verification
      const logsRes = await request("GET", "/api/_inspector/requests");
      assert(logsRes.status === 200 && logsRes.data.total >= 10, `Inspector: Captured ${logsRes.data.total} requests`);

      console.log(`\n----------------------------------------------------`);
      console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
      console.log(`----------------------------------------------------\n`);

      server.close(() => {
        process.exit(failed > 0 ? 1 : 0);
      });
    } catch (err) {
      console.error("Test execution failed:", err);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

runTests();
