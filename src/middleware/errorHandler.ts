import { Request, Response, NextFunction } from "express";

/**
 * Extends the Error interface to include optional statusCode and errors properties.
 */
interface CustomError extends Error {
  statusCode?: number;
  errors?: { [key: string]: string };
}

/**
 * Global error handling middleware for Express applications.
 * 
 * @param err - The error object caught by Express
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || undefined;

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
