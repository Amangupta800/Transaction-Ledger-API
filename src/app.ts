import express, { Request, Response, NextFunction } from "express";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle malformed JSON bodies
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as NodeJS.ErrnoException & { status: number }).status === 400 &&
    "body" in err
  ) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
      code: "INVALID_JSON",
    });
    return;
  }
  next(err);
});

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
