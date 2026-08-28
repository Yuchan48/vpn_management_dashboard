import type { Request, Response, NextFunction } from "express";
import type { AppError } from "../types/api";

export default function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "error" in err
  ) {
    const appError = err as AppError;

    console.error("Error:", appError.error);

    return res.status(appError.status).json({
      error: appError.error,
    });
  }

  if (err instanceof Error) {
    console.error("Error:", err.message);

    return res.status(500).json({
      error: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    error: "Internal Server Error",
  });
}
