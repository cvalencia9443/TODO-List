import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { schema } from "./schema";
import { Ticket } from "./models/Ticket";

const adapter = new SQLiteAdapter({
  schema,
  // Disable JSI for now to avoid initialization issues
  jsi: false,
  onSetUpError: (error) => {
    console.error("Database setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Ticket],
});
