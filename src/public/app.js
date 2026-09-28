let catalogData = [];
let activeCategory = "all";
let capturedLogs = [];

async function init() {
  setupTabs();
  setupSearch();
  setupOptions();
  await loadCatalog();
  await loadLogs();

  // Auto-refresh logs every 5 seconds
  setInterval(loadLogs, 5000);
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.dataset.tab === "catalog" ? "tabCatalog" : "tabInspector";
      document.getElementById(targetId).classList.add("active");
      if (btn.dataset.tab === "inspector") loadLogs();
    });
  });

  document.getElementById("btnRefreshLogs").addEventListener("click", loadLogs);
  document.getElementById("btnClearLogs").addEventListener("click", clearLogs);
  document.getElementById("btnResetDb").addEventListener("click", resetDb);
}

async function loadCatalog() {
  try {
    const res = await fetch("/api/_inspector/catalog");
    const data = await res.json();
    catalogData = data.catalog || [];
    renderSidebar();
    renderEndpoints();
  } catch (err) {
    console.error("Failed to load catalog", err);
  }
}

function renderSidebar() {
  const nav = document.getElementById("categoryNav");
  nav.innerHTML = "";

  const allItem = document.createElement("div");
  allItem.className = `nav-item ${activeCategory === "all" ? "active" : ""}`;
  allItem.textContent = "All Categories";
  allItem.onclick = () => {
    activeCategory = "all";
    updateSidebarActive();
    renderEndpoints();
  };
  nav.appendChild(allItem);

  catalogData.forEach(cat => {
    const item = document.createElement("div");
    item.className = `nav-item ${activeCategory === cat.category ? "active" : ""}`;
    item.textContent = cat.category;
    item.onclick = () => {
      activeCategory = cat.category;
      updateSidebarActive();
      renderEndpoints();
    };
    nav.appendChild(item);
  });
}

function updateSidebarActive() {
  const items = document.querySelectorAll("#categoryNav .nav-item");
  items.forEach(el => {
    if (el.textContent === "All Categories" && activeCategory === "all") {
      el.classList.add("active");
    } else if (el.textContent === activeCategory) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

function renderEndpoints() {
  const container = document.getElementById("endpointList");
  container.innerHTML = "";

  const searchQuery = document.getElementById("searchInput").value.toLowerCase();

  catalogData.forEach(cat => {
    if (activeCategory !== "all" && cat.category !== activeCategory) return;

    const filtered = cat.items.filter(item => 
      item.path.toLowerCase().includes(searchQuery) || 
      item.description.toLowerCase().includes(searchQuery) ||
      cat.category.toLowerCase().includes(searchQuery)
    );

    if (filtered.length === 0) return;

    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = "endpoint-card";
      card.innerHTML = `
        <div class="card-top">
          <span class="method-badge method-${item.method.toLowerCase()}">${item.method}</span>
          <span class="path-text">${item.path}</span>
        </div>
        <div class="card-desc">${item.description}</div>
      `;
      card.onclick = () => testEndpoint(item);
      container.appendChild(card);
    });
  });
}

function setupSearch() {
  document.getElementById("searchInput").addEventListener("input", renderEndpoints);
}

function setupOptions() {
  // Handled dynamically in testEndpoint
}

async function testEndpoint(item) {
  const meta = document.getElementById("testerMeta");
  const output = document.getElementById("responseOutput");

  // Replace placeholder in paths like :id or :accountSid
  let targetUrl = item.path
    .replace(":id", "usr_1")
    .replace(":idOrSlug", "post_1")
    .replace(":owner", "umberbyte")
    .replace(":repo", "dummyAPI")
    .replace(":accountSid", "AC_dummy_account_123")
    .replace(":projectId", "dummy-project-001");

  // Query parameter modifications for simulator
  const queryParams = new URLSearchParams();
  if (document.getElementById("chkDelay").checked) {
    queryParams.append("sleep", "500");
  }
  if (document.getElementById("chkError").checked) {
    queryParams.append("mock_error", "rate_limit");
  }

  const queryString = queryParams.toString();
  if (queryString) {
    targetUrl += (targetUrl.includes("?") ? "&" : "?") + queryString;
  }

  meta.innerHTML = `Sending <strong>${item.method}</strong> to <code>${targetUrl}</code> ...`;
  output.innerHTML = "<code>Executing request...</code>";

  const startTime = performance.now();
  try {
    const fetchOptions = {
      method: item.method,
      headers: { "Content-Type": "application/json" }
    };

    if (item.method !== "GET" && item.method !== "HEAD") {
      fetchOptions.body = JSON.stringify({
        testPayload: true,
        timestamp: new Date().toISOString(),
        email: "test@example.com",
        name: "Test User",
        amount: 2500
      });
    }

    const res = await fetch(targetUrl, fetchOptions);
    const durationMs = Math.round(performance.now() - startTime);

    let body;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    meta.innerHTML = `Status: <strong style="color: ${res.ok ? '#34d399' : '#f87171'}">${res.status} ${res.statusText}</strong> | Time: <strong>${durationMs}ms</strong> | <code>${targetUrl}</code>`;
    output.innerHTML = `<code>${JSON.stringify(body, null, 2)}</code>`;

    // Refresh logs shortly after request
    setTimeout(loadLogs, 300);
  } catch (err) {
    meta.innerHTML = `<span style="color:#f87171">Request Error: ${err.message}</span>`;
    output.innerHTML = `<code>${err.stack}</code>`;
  }
}

async function loadLogs() {
  try {
    const res = await fetch("/api/_inspector/requests?limit=50");
    const data = await res.json();
    capturedLogs = data.requests || [];
    document.getElementById("logCount").textContent = data.total || 0;

    const tbody = document.getElementById("logsTableBody");
    if (capturedLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">No requests captured yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = capturedLogs.map(log => `
      <tr onclick="showLogDetail('${log.id}')">
        <td style="color:#94a3b8;">${new Date(log.timestamp).toLocaleTimeString()}</td>
        <td><span class="method-badge method-${log.method.toLowerCase()}">${log.method}</span></td>
        <td style="color:#f8fafc;">${log.path}</td>
        <td style="color:#38bdf8;">View JSON</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load logs", err);
  }
}

window.showLogDetail = function(id) {
  const log = capturedLogs.find(l => l.id === id);
  if (!log) return;
  const modal = document.getElementById("logDetailModal");
  const content = document.getElementById("logDetailContent");
  content.innerHTML = `<code>${JSON.stringify(log, null, 2)}</code>`;
  modal.style.display = "block";
};

async function clearLogs() {
  await fetch("/api/_inspector/requests", { method: "DELETE" });
  document.getElementById("logDetailModal").style.display = "none";
  await loadLogs();
}

async function resetDb() {
  if (confirm("Reset in-memory database to seed state?")) {
    await fetch("/api/_inspector/reset-db", { method: "POST" });
    alert("Database state reset!");
  }
}

window.addEventListener("DOMContentLoaded", init);
