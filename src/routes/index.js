import express from "express";
import mvcRouter from "./mvc.js";
import authRouter from "./auth.js";
import integrationsRouter from "./integrations.js";
import messagingRouter from "./messaging.js";
import paymentsRouter from "./payments.js";
import inspectorRouter from "./inspector.js";

export const registerRoutes = (app) => {
  // Test Inspector & Catalog
  app.use("/api/_inspector", inspectorRouter);

  // 1. MVC REST API
  app.use("/api/v1", mvcRouter);

  // 2. Auth & OIDC
  app.use(authRouter);

  // 3. Integrations (Slack, GitHub, Notion, LLM, etc.)
  app.use("/api", integrationsRouter);
  app.use(integrationsRouter); // For /v1/chat/completions

  // 4. Messaging (SendGrid, Twilio, LINE, FCM, SQS)
  app.use(messagingRouter);

  // 5. Payments (Stripe, PayPal, PayPay, PAY.JP, Banking)
  app.use(paymentsRouter);
};
