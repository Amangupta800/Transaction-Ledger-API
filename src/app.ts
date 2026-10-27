import express, { Request, Response } from "express";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Banking API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    code: "NOT_FOUND",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
