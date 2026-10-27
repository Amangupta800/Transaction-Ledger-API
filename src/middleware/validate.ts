import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export type ValidateTarget = "body" | "query" | "params";

// In Express 5, req.query is a read-only getter, so we can't replace it.
// Instead we attach parsed data to req.parsedQuery / req.parsedBody / req.parsedParams
// and read from those in controllers. For body and params we still assign directly
// since those remain writable.
declare global {
  namespace Express {
    interface Request {
      parsedQuery?: Record<string, unknown>;
    }
  }
}

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const source = target === "query" ? req.query : req[target];
    const result = schema.safeParse(source);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (target === "query") {
      // Store parsed query separately — req.query is read-only in Express 5
      req.parsedQuery = result.data as Record<string, unknown>;
    } else {
      // body and params are still writable
      req[target] = result.data;
    }

    next();
  };
}
