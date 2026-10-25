import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Express middleware that logs HTTP request metadata after the response is sent.
 * Captures: method, URL path, response status code, and response time in ms.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    // Skip Swagger UI requests to avoid noise in logs
    if (req.originalUrl.startsWith("/api-docs")) return;

    const responseTime = Date.now() - start;

    logger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
    });
  });

  next();
}
