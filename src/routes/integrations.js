import express from "express";

const router = express.Router();

// ----------------------------------------------------
// 1. Slack API
// ----------------------------------------------------
router.post("/slack/chat.postMessage", (req, res) => {
  const { channel = "C12345678", text = "Hello from dummyAPI", blocks } = req.body || {};
  res.json({
    ok: true,
    channel,
    ts: `${Math.floor(Date.now() / 1000)}.000100`,
    message: {
      bot_id: "B12345678",
      type: "message",
      text,
      user: "U12345678",
      ts: `${Math.floor(Date.now() / 1000)}.000100`,
      blocks: blocks || []
    }
  });
});

router.get("/slack/conversations.list", (req, res) => {
  res.json({
    ok: true,
    channels: [
      { id: "C12345678", name: "general", is_channel: true, num_members: 12 },
      { id: "C87654321", name: "development", is_channel: true, num_members: 8 }
    ],
    response_metadata: { next_cursor: "" }
  });
});

router.post("/slack/views.open", (req, res) => {
  res.json({ ok: true, view: { id: `V_${Date.now()}`, type: "modal", title: { type: "plain_text", text: "dummy modal" } } });
});

// ----------------------------------------------------
// 2. GitHub REST API
// ----------------------------------------------------
router.get("/github/user", (req, res) => {
  res.json({
    login: "umberbyte",
    id: 12345678,
    avatar_url: "https://github.com/identicons/umberbyte.png",
    name: "Umberbyte Dev",
    company: "Stub Corp",
    public_repos: 42,
    followers: 128
  });
});

router.get("/github/repos/:owner/:repo/issues", (req, res) => {
  res.json([
    {
      id: 101,
      number: 1,
      title: "Initial dummyAPI setup",
      state: "open",
      user: { login: "umberbyte" },
      created_at: "2026-09-28T00:00:00Z"
    }
  ]);
});

router.post("/github/repos/:owner/:repo/issues", (req, res) => {
  res.status(201).json({
    id: Math.floor(Math.random() * 10000),
    number: Math.floor(Math.random() * 100),
    title: req.body.title || "New Mock Issue",
    body: req.body.body || "",
    state: "open",
    user: { login: "umberbyte" },
    created_at: new Date().toISOString()
  });
});

router.get("/github/repos/:owner/:repo/pulls", (req, res) => {
  res.json([
    { id: 201, number: 12, title: "Feature: Add Payment Stubs", state: "open", draft: false }
  ]);
});

// ----------------------------------------------------
// 3. Notion API
// ----------------------------------------------------
router.post("/notion/v1/pages", (req, res) => {
  res.status(200).json({
    object: "page",
    id: `notion_page_${Date.now()}`,
    created_time: new Date().toISOString(),
    properties: req.body.properties || {},
    url: "https://www.notion.so/dummy-page-url"
  });
});

router.post("/notion/v1/databases/:id/query", (req, res) => {
  res.json({
    object: "list",
    results: [
      {
        object: "page",
        id: "page_notion_1",
        properties: { Title: { title: [{ plain_text: "Task A" }] }, Status: { select: { name: "Done" } } }
      }
    ],
    has_more: false
  });
});

// ----------------------------------------------------
// 4. Google Workspace (Calendar / Drive)
// ----------------------------------------------------
router.get("/google/calendar/events", (req, res) => {
  res.json({
    kind: "calendar#events",
    summary: "Mock Primary Calendar",
    items: [
      {
        id: "evt_1",
        summary: "Sprint Planning",
        start: { dateTime: "2026-09-29T10:00:00+09:00" },
        end: { dateTime: "2026-09-29T11:00:00+09:00" }
      }
    ]
  });
});

router.post("/google/calendar/events", (req, res) => {
  res.status(201).json({
    kind: "calendar#event",
    id: `evt_${Date.now()}`,
    summary: req.body.summary || "New Meeting",
    start: req.body.start || { dateTime: new Date().toISOString() },
    end: req.body.end || { dateTime: new Date(Date.now() + 3600000).toISOString() }
  });
});

router.get("/google/drive/files", (req, res) => {
  res.json({
    kind: "drive#fileList",
    files: [
      { id: "gfile_1", name: "Roadmap 2026.docx", mimeType: "application/vnd.google-apps.document" },
      { id: "gfile_2", name: "Budget Q3.xlsx", mimeType: "application/vnd.google-apps.spreadsheet" }
    ]
  });
});

// ----------------------------------------------------
// 5. CRM (Salesforce / HubSpot)
// ----------------------------------------------------
router.post("/salesforce/sobjects/Contact", (req, res) => {
  res.status(201).json({
    id: `003${Math.random().toString(36).substring(2, 17)}`,
    success: true,
    errors: []
  });
});

router.post("/hubspot/crm/v3/objects/contacts", (req, res) => {
  res.status(201).json({
    id: `hs_${Date.now()}`,
    properties: req.body.properties || { email: "contact@example.com" },
    createdAt: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 6. External Data & AI (Weather, DeepL, LLM)
// ----------------------------------------------------
router.get("/weather", (req, res) => {
  const city = req.query.city || "Tokyo";
  res.json({
    city,
    temperature_celsius: 22.5,
    condition: "Sunny",
    humidity: 55,
    wind_speed_kmh: 12.0,
    timestamp: new Date().toISOString()
  });
});

router.post("/deepl/translate", (req, res) => {
  const { text = "Hello world", target_lang = "JA" } = req.body || {};
  const mockTranslations = {
    "Hello world": "こんにちは世界",
    "Thank you": "ありがとうございます"
  };
  res.json({
    translations: [
      {
        detected_source_language: "EN",
        text: mockTranslations[text] || `[${target_lang} Translation of: ${text}]`
      }
    ]
  });
});

// OpenAI / Gemini compatible Chat Completions API
router.post("/v1/chat/completions", (req, res) => {
  const { messages = [], model = "gpt-4o-mini" } = req.body || {};
  const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "Hello";

  res.json({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: `Mock response from dummyAPI LLM stub for: "${lastUserMsg}"`
        },
        finish_reason: "stop"
      }
    ],
    usage: { prompt_tokens: 15, completion_tokens: 20, total_tokens: 35 }
  });
});

export default router;
