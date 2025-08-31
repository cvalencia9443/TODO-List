#!/usr/bin/env ts-node

import { Command } from "commander";
import dotenv from "dotenv";
import { runMigrations, createMigration } from "../config/migrations";
import pool from "../config/database";
import logger from "../config/logger";

// Load environment variables
dotenv.config();

const program = new Command();

program.name("db").description("Database management CLI").version("1.0.0");

program
  .command("migrate")
  .description("Run pending database migrations")
  .action(async () => {
    try {
      await runMigrations();
      process.exit(0);
    } catch (error) {
      logger.error("Migration failed:", error);
      process.exit(1);
    }
  });

program
  .command("create-migration <name>")
  .description("Create a new migration file")
  .action(async (name: string) => {
    try {
      const filename = await createMigration(name);
      console.log(`Created migration: ${filename}`);
      process.exit(0);
    } catch (error) {
      logger.error("Failed to create migration:", error);
      process.exit(1);
    }
  });

program
  .command("reset")
  .description("Reset database (WARNING: This will delete all data)")
  .option("--force", "Skip confirmation prompt")
  .action(async (options) => {
    if (!options.force) {
      console.log("This will delete ALL data in the database.");
      console.log("Use --force flag to confirm this action.");
      process.exit(1);
    }

    try {
      // Drop all tables
      await pool.query(`
        DROP TABLE IF EXISTS tickets CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS migrations CASCADE;
      `);

      logger.info("Database reset completed");

      // Run migrations to recreate tables
      await runMigrations();

      process.exit(0);
    } catch (error) {
      logger.error("Database reset failed:", error);
      process.exit(1);
    }
  });

program
  .command("seed")
  .description("Seed database with sample data")
  .action(async () => {
    try {
      // Create sample user
      const userId = "550e8400-e29b-41d4-a716-446655440000";
      await pool.query(
        `
        INSERT INTO users (id, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `,
        [
          userId,
          "demo@example.com",
          "$2b$12$LQv3c1yqBwEHxv68fxzjAu4CRAzHhyh1GT4wXvUcwmf.HMQOFvuBG",
        ]
      );

      // Create sample tickets
      const sampleTickets = [
        {
          title: "Setup project structure",
          description: "Initialize the project with proper folder structure",
          status: "done",
        },
        {
          title: "Implement user authentication",
          description: "Add login and registration functionality",
          status: "in_progress",
        },
        {
          title: "Create ticket management",
          description: "Build CRUD operations for tickets",
          status: "in_progress",
        },
        {
          title: "Add offline support",
          description: "Implement WatermelonDB for offline functionality",
          status: "todo",
        },
        {
          title: "Write documentation",
          description: "Create comprehensive API documentation",
          status: "todo",
        },
      ];

      for (const ticket of sampleTickets) {
        await pool.query(
          `
          INSERT INTO tickets (id, title, description, status, user_id, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
        `,
          [ticket.title, ticket.description, ticket.status, userId]
        );
      }

      logger.info("Database seeded with sample data");
      logger.info("Demo user: demo@example.com / password123");
      process.exit(0);
    } catch (error) {
      logger.error("Database seeding failed:", error);
      process.exit(1);
    }
  });

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
  process.exit(1);
});

program.parse();


