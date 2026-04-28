import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      issues: error.issues,
    });
  }

  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}