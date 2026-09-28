// Inspector middleware: keeps track of incoming requests for inspection in tests or web UI

const MAX_LOGS = 100;
export const requestHistory = [];

export const inspectorMiddleware = (req, res, next) => {
  // Ignore requests to the inspector or static dashboard assets to keep logs clean
  if (req.path.startsWith("/api/_inspector") || req.path === "/" || req.path.startsWith("/public") || req.path.endsWith(".css") || req.path.endsWith(".js") || req.path.endsWith(".ico")) {
    return next();
  }

  const logEntry = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl || req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    ip: req.ip || req.connection.remoteAddress
  };

  requestHistory.unshift(logEntry);
  if (requestHistory.length > MAX_LOGS) {
    requestHistory.pop();
  }

  next();
};

export const clearRequestHistory = () => {
  requestHistory.length = 0;
};
