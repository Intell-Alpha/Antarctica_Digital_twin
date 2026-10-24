import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate limiter middleware for sensitive POST endpoints (e.g., simulation, commander).
 * Limits incoming POST requests to 30 requests per minute per IP address.
 * Returns HTTP 429 Too Many Requests when the threshold is exceeded.
 */
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  skip: (req: Request) => req.method !== "POST",
  handler: (req: Request, res: Response) => {
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Maximum 30 requests per minute allowed.",
    });
  },
  validate: { xForwardedForHeader: false },
});

export const postRateLimiter = rateLimiter;
export default rateLimiter;
