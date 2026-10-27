import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors — Zod v4 uses .issues (not .errors)
  if (err instanceof ZodError) {
    const details = err.issues.map((e) => ({
      field: e.path.join(".") || "root",
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
    });
    return;
  }

  // Our custom application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[]) ?? [];
      res.status(409).json({
        success: false,
        error: `Duplicate entry: a record with this ${fields.join(", ")} already exists`,
        code: "CONFLICT",
      });
      return;
    }

    // Prisma record not found
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Record not found",
        code: "NOT_FOUND",
      });
      return;
    }

    // Prisma foreign key constraint
    if (err.code === "P2003") {
      res.status(422).json({
        success: false,
        error: "Referenced record does not exist",
        code: "FOREIGN_KEY_VIOLATION",
      });
      return;
    }
  }

  // Unknown errors
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    success: false,
    error: "An unexpected error occurred",
    code: "INTERNAL_SERVER_ERROR",
  });
}
