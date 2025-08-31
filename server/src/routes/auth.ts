import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/database";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import { authLimiter } from "../middleware/rateLimiter";
import { generateToken, AuthenticatedRequest } from "../middleware/auth";
import { registerSchema, loginSchema } from "../validation/authValidation";
import { CreateUserRequest, LoginRequest, AuthResponse } from "../models/User";
import logger from "../config/logger";

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Register new user
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password }: CreateUserRequest = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError("User with this email already exists", 409);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const now = new Date();

    const result = await pool.query(
      "INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, created_at",
      [userId, email, passwordHash, now, now]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    logger.info("User registered successfully:", {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  })
);

// Login user
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      logger.warn("Failed login attempt:", {
        email,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    logger.info("User logged in successfully:", {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };

    res.json({
      success: true,
      data: response,
    });
  })
);

// Get current user profile
router.get(
  "/me",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      },
    });
  })
);

export default router;


