import fs from "fs";
import path from "path";
import pool from "./database";
import logger from "./logger";

interface Migration {
  filename: string;
  content: string;
}

export async function runMigrations(): Promise<void> {
  try {
    // Ensure migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of applied migrations
    const appliedResult = await pool.query(
      "SELECT filename FROM migrations ORDER BY id"
    );
    const appliedMigrations = new Set(
      appliedResult.rows.map((row) => row.filename)
    );

    // Get list of migration files
    const migrationsDir = path.join(__dirname, "../migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const pendingMigrations: Migration[] = [];

    for (const filename of migrationFiles) {
      if (!appliedMigrations.has(filename)) {
        const content = fs.readFileSync(
          path.join(migrationsDir, filename),
          "utf8"
        );
        pendingMigrations.push({ filename, content });
      }
    }

    if (pendingMigrations.length === 0) {
      logger.info("No pending migrations");
      return;
    }

    logger.info(`Running ${pendingMigrations.length} pending migrations`);

    // Run pending migrations in a transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const migration of pendingMigrations) {
        logger.info(`Applying migration: ${migration.filename}`);

        // Execute migration SQL
        await client.query(migration.content);

        // Record migration as applied
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          migration.filename,
        ]);

        logger.info(`Migration applied: ${migration.filename}`);
      }

      await client.query("COMMIT");
      logger.info("All migrations completed successfully");
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Migration failed, rolling back:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error("Error running migrations:", error);
    throw error;
  }
}

export async function createMigration(name: string): Promise<string> {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `${timestamp}_${name
    .toLowerCase()
    .replace(/\s+/g, "_")}.sql`;
  const filepath = path.join(__dirname, "../migrations", filename);

  const template = `-- Migration: ${filename}
-- Description: ${name}
-- Created: ${new Date().toISOString().slice(0, 10)}

-- Add your SQL statements here

-- Record this migration
INSERT INTO migrations (filename) VALUES ('${filename}') ON CONFLICT (filename) DO NOTHING;
`;

  fs.writeFileSync(filepath, template);
  logger.info(`Created migration file: ${filename}`);

  return filename;
}


