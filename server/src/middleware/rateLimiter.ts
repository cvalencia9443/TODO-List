import rateLimit from "express-rate-limit";
import logger from "../config/logger";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later.",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn("Rate limit exceeded:", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
    });

    res.status(429).json({
      success: false,
      error: {
        message: "Too many requests from this IP, please try again later.",
      },
    });
  },
});

// Stricter rate limiter for write operations
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 create requests per minute
  message: {
    success: false,
    error: {
      message: "Too many create requests, please slow down.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});


