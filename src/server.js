import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { inspectorMiddleware } from "./middleware/inspector.js";
import { simulatorMiddleware } from "./middleware/simulator.js";
import { registerRoutes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 6080;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Web Dashboard
app.use(express.static(path.join(__dirname, "public")));

// Inspection and Simulation Middleware
app.use(inspectorMiddleware);
app.use(simulatorMiddleware);

// Swagger & OpenAPI Specification
app.get("/openapi.json", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "openapi.json"));
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "docs.html"));
});

// Register All Stub Routers
registerRoutes(app);

// Fallback 404 for unhandled API requests
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `No stub endpoint found matching ${req.method} ${req.originalUrl}`
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred"
    }
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`🚀 dummyAPI Stub Server is running on port ${PORT}`);
    console.log(`🌐 Dashboard & API Explorer: http://localhost:${PORT}`);
    console.log(`📖 Swagger UI Reference:    http://localhost:${PORT}/docs`);
    console.log(`📄 OpenAPI Specification:  http://localhost:${PORT}/openapi.json`);
    console.log(`Docker & Local Ready | Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`====================================================`);
  });
}

export default app;
