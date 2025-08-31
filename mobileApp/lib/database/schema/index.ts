import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "tickets",
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "status", type: "string" },
        { name: "server_id", type: "string", isOptional: true },
        { name: "is_synced", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
