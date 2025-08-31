import { runMigrations } from "./migrations";
import logger from "./logger";

export async function initializeDatabase() {
  try {
    logger.info("Initializing database...");
    await runMigrations();
    logger.info("✅ Database initialized successfully");
  } catch (error) {
    logger.error("❌ Error initializing database:", error);
    throw error;
  }
}
