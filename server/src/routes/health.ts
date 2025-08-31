import { Router, Request, Response } from "express";
import pool from "../config/database";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../config/logger";

const router = Router();

// Basic health check
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      status: "OK",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  })
);

// Detailed health check with database connectivity
router.get(
  "/detailed",
  asyncHandler(async (req: Request, res: Response) => {
    const healthCheck = {
      success: true,
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown",
      services: {
        database: "unknown",
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };

    try {
      // Test database connection
      const dbResult = await pool.query("SELECT NOW() as current_time");
      healthCheck.services.database = "healthy";

      logger.info("Health check performed:", {
        status: "healthy",
        ip: req.ip,
      });
    } catch (error) {
      healthCheck.success = false;
      healthCheck.status = "ERROR";
      healthCheck.services.database = "unhealthy";

      logger.error("Health check failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        ip: req.ip,
      });
    }

    const statusCode = healthCheck.success ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  })
);

// Readiness probe (for Kubernetes)
router.get(
  "/ready",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await pool.query("SELECT 1");
      res.json({
        success: true,
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: "not ready",
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  })
);

// Liveness probe (for Kubernetes)
router.get(
  "/live",
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })
);

export default router;


