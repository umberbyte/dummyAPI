import express from "express";

const router = express.Router();

// ----------------------------------------------------
// 1. Stripe API style
// ----------------------------------------------------
router.post("/v1/payment_intents", (req, res) => {
  const { amount = 2000, currency = "jpy", payment_method_types = ["card"] } = req.body || {};
  const id = `pi_${Math.random().toString(36).substr(2, 24)}`;
  res.status(200).json({
    id,
    object: "payment_intent",
    amount: Number(amount),
    currency: currency.toLowerCase(),
    status: "requires_payment_method",
    client_secret: `${id}_secret_${Math.random().toString(36).substr(2, 24)}`,
    created: Math.floor(Date.now() / 1000),
    payment_method_types,
    livemode: false
  });
});

router.post("/v1/checkout/sessions", (req, res) => {
  const sessionId = `cs_test_${Math.random().toString(36).substr(2, 24)}`;
  res.status(200).json({
    id: sessionId,
    object: "checkout.session",
    url: `https://checkout.stripe.com/pay/${sessionId}`,
    status: "open",
    payment_status: "unpaid",
    created: Math.floor(Date.now() / 1000),
    success_url: req.body?.success_url || "https://example.com/success",
    cancel_url: req.body?.cancel_url || "https://example.com/cancel"
  });
});

router.post("/v1/customers", (req, res) => {
  const customerId = `cus_${Math.random().toString(36).substr(2, 14)}`;
  res.status(200).json({
    id: customerId,
    object: "customer",
    email: req.body?.email || "customer@example.com",
    name: req.body?.name || "Jane Doe",
    created: Math.floor(Date.now() / 1000)
  });
});

router.post("/v1/refunds", (req, res) => {
  const refundId = `re_${Math.random().toString(36).substr(2, 24)}`;
  res.status(200).json({
    id: refundId,
    object: "refund",
    amount: req.body?.amount || 1000,
    currency: "jpy",
    payment_intent: req.body?.payment_intent || "pi_mock123",
    status: "succeeded",
    created: Math.floor(Date.now() / 1000)
  });
});

// ----------------------------------------------------
// 2. PayPal REST API style
// ----------------------------------------------------
router.post("/v2/checkout/orders", (req, res) => {
  const orderId = `PAYPAL_${Date.now()}`;
  res.status(201).json({
    id: orderId,
    status: "CREATED",
    intent: "CAPTURE",
    purchase_units: req.body?.purchase_units || [
      {
        reference_id: "default",
        amount: { currency_code: "USD", value: "50.00" }
      }
    ],
    links: [
      { href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`, rel: "approve", method: "GET" }
    ]
  });
});

router.post("/v2/checkout/orders/:id/capture", (req, res) => {
  res.status(201).json({
    id: req.params.id,
    status: "COMPLETED",
    payer: { email_address: "buyer@sandbox.paypal.com", payer_id: "PAYER_123" },
    purchase_units: [{ payments: { captures: [{ id: `CAP_${Date.now()}`, status: "COMPLETED" }] } }]
  });
});

// ----------------------------------------------------
// 3. PayPay Open Payment API style
// ----------------------------------------------------
router.post("/v2/codes", (req, res) => {
  const codeId = `04-dummy-code-${Date.now()}`;
  res.status(201).json({
    resultInfo: { code: "SUCCESS", message: "Success", codeId: "08100001" },
    data: {
      codeId,
      url: `https://qr.paypay.ne.jp/${codeId}`,
      expiryDate: Math.floor(Date.now() / 1000) + 300,
      merchantPaymentId: req.body?.merchantPaymentId || `mp_${Date.now()}`,
      amount: req.body?.amount || { amount: 1500, currency: "JPY" }
    }
  });
});

router.post("/v2/payments", (req, res) => {
  const paymentId = `paypay_pay_${Date.now()}`;
  res.status(201).json({
    resultInfo: { code: "SUCCESS", message: "Success", codeId: "08100001" },
    data: {
      paymentId,
      status: "COMPLETED",
      acceptedAt: Math.floor(Date.now() / 1000),
      merchantPaymentId: req.body?.merchantPaymentId || `mp_${Date.now()}`,
      amount: req.body?.amount || { amount: 2500, currency: "JPY" }
    }
  });
});

// ----------------------------------------------------
// 4. PAY.JP & Paidy (BNPL) style
// ----------------------------------------------------
router.post("/v1/charges", (req, res) => {
  res.status(200).json({
    id: `ch_${Date.now()}`,
    object: "charge",
    amount: req.body?.amount || 3500,
    currency: "jpy",
    paid: true,
    captured: true,
    card: { last4: "4242", brand: "Visa" },
    created: Math.floor(Date.now() / 1000)
  });
});

router.post("/payments/paidy", (req, res) => {
  res.status(201).json({
    id: `pay_paidy_${Date.now()}`,
    status: "authorized",
    amount: req.body?.amount || 8900,
    currency: "JPY",
    tier: "classic",
    created_at: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 5. Banking / BaaS API style (GMO Aozora / SBI)
// ----------------------------------------------------
router.get("/api/banking/accounts/balance", (req, res) => {
  res.status(200).json({
    accountId: "1234567",
    accountName: "テストショウジ（カ",
    currency: "JPY",
    balance: 14250000,
    availableBalance: 14250000,
    asOf: new Date().toISOString()
  });
});

router.post("/api/banking/transfers", (req, res) => {
  const { transferAmount = 50000, beneficiaryBankCode = "0001" } = req.body || {};
  res.status(202).json({
    transferId: `trf_${Date.now()}`,
    status: "accepted",
    transferAmount: Number(transferAmount),
    fee: 145,
    beneficiaryBankCode,
    requestedAt: new Date().toISOString()
  });
});

export default router;
