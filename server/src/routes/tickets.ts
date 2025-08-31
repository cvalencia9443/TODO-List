import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/database";
import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
} from "../models/Ticket";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest,
} from "../middleware/auth";
import { apiLimiter, createLimiter } from "../middleware/rateLimiter";
import {
  createTicketSchema,
  updateTicketSchema,
  ticketIdSchema,
} from "../validation/ticketValidation";
import logger from "../config/logger";

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Get all tickets for authenticated user
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    let query = "SELECT * FROM tickets";
    let params: any[] = [];

    // If user is authenticated, only show their tickets
    if (req.user) {
      query += " WHERE user_id = $1";
      params.push(req.user.id);
    } else {
      // For unauthenticated users, show public tickets (or none for security)
      query += " WHERE user_id IS NULL";
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    logger.info("Tickets fetched:", {
      userId: req.user?.id || "anonymous",
      count: result.rows.length,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

// Get ticket by ID
router.get(
  "/:id",
  validate(ticketIdSchema, "params"),
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    let query = "SELECT * FROM tickets WHERE id = $1";
    let params = [id];

    // If user is authenticated, ensure they can only access their own tickets
    if (req.user) {
      query += " AND user_id = $2";
      params.push(req.user.id);
    } else {
      query += " AND user_id IS NULL";
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw new AppError("Ticket not found", 404);
    }

    logger.info("Ticket fetched:", {
      ticketId: id,
      userId: req.user?.id || "anonymous",
      ip: req.ip,
    });

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Create new ticket
router.post(
  "/",
  createLimiter,
  validate(createTicketSchema),
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, status }: CreateTicketRequest = req.body;

    const id = uuidv4();
    const now = new Date();
    const userId = req.user?.id || null;

    const result = await pool.query(
      "INSERT INTO tickets (id, title, description, status, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [id, title, description, status, userId, now, now]
    );

    logger.info("Ticket created:", {
      ticketId: id,
      userId: userId || "anonymous",
      title,
      status,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Update ticket
router.put(
  "/:id",
  validate(ticketIdSchema, "params"),
  validate(updateTicketSchema),
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, status }: UpdateTicketRequest = req.body;

    // Check if ticket exists and user has permission
    let checkQuery = "SELECT * FROM tickets WHERE id = $1";
    let checkParams = [id];

    if (req.user) {
      checkQuery += " AND user_id = $2";
      checkParams.push(req.user.id);
    } else {
      checkQuery += " AND user_id IS NULL";
    }

    const existingTicket = await pool.query(checkQuery, checkParams);
    if (existingTicket.rows.length === 0) {
      throw new AppError("Ticket not found", 404);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    let updateQuery = `UPDATE tickets SET ${updates.join(
      ", "
    )} WHERE id = $${paramCount}`;

    if (req.user) {
      updateQuery += ` AND user_id = $${paramCount + 1}`;
      values.push(req.user.id);
    } else {
      updateQuery += " AND user_id IS NULL";
    }

    updateQuery += " RETURNING *";

    const result = await pool.query(updateQuery, values);

    logger.info("Ticket updated:", {
      ticketId: id,
      userId: req.user?.id || "anonymous",
      updates: { title, description, status },
      ip: req.ip,
    });

    res.json({
      success: true,
      data: result.rows[0],
    });
  })
);

// Delete ticket
router.delete(
  "/:id",
  validate(ticketIdSchema, "params"),
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    let deleteQuery = "DELETE FROM tickets WHERE id = $1";
    let params = [id];

    if (req.user) {
      deleteQuery += " AND user_id = $2";
      params.push(req.user.id);
    } else {
      deleteQuery += " AND user_id IS NULL";
    }

    deleteQuery += " RETURNING *";

    const result = await pool.query(deleteQuery, params);

    if (result.rows.length === 0) {
      throw new AppError("Ticket not found", 404);
    }

    logger.info("Ticket deleted:", {
      ticketId: id,
      userId: req.user?.id || "anonymous",
      ip: req.ip,
    });

    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  })
);

export default router;
