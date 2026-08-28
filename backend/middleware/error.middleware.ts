import type { Request, Response, NextFunction } from "express";
import type { AppError } from "../types/api";

export default function errorMiddleware(
  err: AppError,
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
    const appError = err as { status: number; error: string };

    console.error("Error:", appError.error);

    return res.status(appError.status).json({
      error: appError.error,
    });
  }

  if (err instanceof Error) {
    console.error("Error:", err.message);

    return res.status(400).json({
      error: err.message,
    });
  }

  console.error(err);

  return res.status(400).json({
    error: "Internal Server Error",
  });
}
