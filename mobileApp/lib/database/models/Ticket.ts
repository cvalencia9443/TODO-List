import { Model } from "@nozbe/watermelondb";
import { field, date, readonly } from "@nozbe/watermelondb/decorators";

export type TicketStatus = "todo" | "in_progress" | "done";

export class Ticket extends Model {
  static table = "tickets";

  @field("title") title!: string;
  @field("description") description!: string;
  @field("status") status!: TicketStatus;
  @field("server_id") serverId?: string;
  @field("is_synced") isSynced!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}
