import express from "express";

const router = express.Router();

// ----------------------------------------------------
// 1. Email Services (SendGrid & Resend)
// ----------------------------------------------------
// SendGrid Web API v3 style
router.post("/v3/mail/send", (req, res) => {
  const msgId = `sg_msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  res.setHeader("X-Message-Id", msgId);
  // SendGrid typically responds with HTTP 202 Accepted and an empty body
  res.status(202).json({
    status: "queued",
    messageId: msgId,
    timestamp: new Date().toISOString()
  });
});

// Resend style
router.post("/api/resend/emails", (req, res) => {
  const { from = "onboarding@resend.dev", to = ["user@example.com"], subject = "Hello" } = req.body || {};
  res.status(200).json({
    id: `resend_${Date.now()}`,
    from,
    to: Array.isArray(to) ? to : [to],
    created_at: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 2. SMS & Voice (Twilio Programmable SMS)
// ----------------------------------------------------
router.post("/2010-04-01/Accounts/:accountSid/Messages.json", (req, res) => {
  const { accountSid } = req.params;
  const { To = "+819012345678", From = "+15551234567", Body = "Test SMS" } = req.body || {};
  const sid = `SM${Math.random().toString(36).substring(2, 32)}`;

  res.status(201).json({
    sid,
    account_sid: accountSid,
    to: To,
    from: From,
    body: Body,
    status: "queued",
    num_segments: "1",
    num_media: "0",
    direction: "outbound-api",
    api_version: "2010-04-01",
    price: null,
    price_unit: "USD",
    error_code: null,
    error_message: null,
    uri: `/2010-04-01/Accounts/${accountSid}/Messages/${sid}.json`,
    date_created: new Date().toUTCString(),
    date_updated: new Date().toUTCString()
  });
});

// ----------------------------------------------------
// 3. LINE Messaging API
// ----------------------------------------------------
router.post("/v2/bot/message/push", (req, res) => {
  const { to, messages } = req.body || {};
  res.status(200).json({
    sentMessages: (messages || []).map((m, idx) => ({ id: `line_msg_${Date.now()}_${idx}` }))
  });
});

router.post("/v2/bot/message/reply", (req, res) => {
  const { replyToken, messages } = req.body || {};
  res.status(200).json({
    sentMessages: (messages || []).map((m, idx) => ({ id: `line_reply_${Date.now()}_${idx}` }))
  });
});

// ----------------------------------------------------
// 4. Mobile Push Notification (FCM HTTP v1)
// ----------------------------------------------------
router.post("/v1/projects/:projectId/messages:send", (req, res) => {
  const { projectId } = req.params;
  res.status(200).json({
    name: `projects/${projectId}/messages/0:${Date.now()}dummyFcmMessageToken`
  });
});

// ----------------------------------------------------
// 5. Message Queue (AWS SQS & PubSub style)
// ----------------------------------------------------
router.post("/api/sqs/send-message", (req, res) => {
  const { queueUrl = "https://sqs.dummy.amazonaws.com/123/my-queue", messageBody = "{}" } = req.body || {};
  res.status(200).json({
    SendMessageResponse: {
      SendMessageResult: {
        MD5OfMessageBody: "7ac66c0f148de9519b8bd264312c4d64",
        MessageId: `sqs_msg_${Date.now()}`,
        SequenceNumber: null
      },
      ResponseMetadata: {
        RequestId: `req_${Math.random().toString(36).substr(2, 10)}`
      }
    }
  });
});

router.post("/api/pubsub/publish", (req, res) => {
  res.status(200).json({
    messageIds: [`pubsub_msg_${Date.now()}`]
  });
});

export default router;
