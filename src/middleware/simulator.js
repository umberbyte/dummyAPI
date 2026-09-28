// Latency and Error simulator middleware
// Allows testing client timeout and error handling using query params or headers

export const simulatorMiddleware = async (req, res, next) => {
  // 1. Latency simulation (?sleep=1000 or x-mock-delay: 1000)
  const delayParam = req.query.sleep || req.headers["x-mock-delay"];
  if (delayParam) {
    const ms = parseInt(delayParam, 10);
    if (!isNaN(ms) && ms > 0) {
      // Cap at 10000ms for safety
      const capped = Math.min(ms, 10000);
      await new Promise(resolve => setTimeout(resolve, capped));
    }
  }

  // 2. Mock Error simulation (?mock_error=rate_limit or ?mock_status=503)
  const mockStatus = req.query.mock_status || req.headers["x-mock-status"];
  if (mockStatus) {
    const statusCode = parseInt(mockStatus, 10);
    if (!isNaN(statusCode) && statusCode >= 400 && statusCode <= 599) {
      return res.status(statusCode).json({
        error: {
          code: `MOCK_${statusCode}`,
          message: `Simulated error status code ${statusCode}`,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  const mockError = req.query.mock_error || req.headers["x-mock-error"];
  if (mockError) {
    if (mockError === "rate_limit") {
      return res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too Many Requests: Mock rate limit exceeded. Retry after 60 seconds.",
          retryAfterSeconds: 60
        }
      });
    }
    if (mockError === "unauthorized") {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Simulated invalid or missing credentials"
        }
      });
    }
  }

  next();
};
