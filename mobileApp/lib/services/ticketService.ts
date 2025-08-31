import { Q } from "@nozbe/watermelondb";
import { database } from "@/lib/database";
import { Ticket, TicketStatus } from "@/lib/database/models/Ticket";
import { ApiService } from "./api";

export interface CreateTicketData {
  title: string;
  description: string;
  status: TicketStatus;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
}

class TicketService {
  private apiService = new ApiService();

  // Local CRUD operations
  async getLocalTickets(): Promise<Ticket[]> {
    const ticketsCollection = database.get<Ticket>("tickets");
    return await ticketsCollection.query().fetch();
  }

  async getLocalTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
    const ticketsCollection = database.get<Ticket>("tickets");
    return await ticketsCollection.query(Q.where("status", status)).fetch();
  }

  async createLocalTicket(data: CreateTicketData): Promise<Ticket> {
    return await database.write(async () => {
      const ticketsCollection = database.get<Ticket>("tickets");
      return await ticketsCollection.create((ticket) => {
        ticket.title = data.title;
        ticket.description = data.description;
        ticket.status = data.status;
        ticket.isSynced = false;
      });
    });
  }

  async updateLocalTicket(
    ticket: Ticket,
    data: UpdateTicketData
  ): Promise<Ticket> {
    return await database.write(async () => {
      return await ticket.update((record) => {
        if (data.title !== undefined) record.title = data.title;
        if (data.description !== undefined)
          record.description = data.description;
        if (data.status !== undefined) record.status = data.status;
        record.isSynced = false;
      });
    });
  }

  async deleteLocalTicket(ticket: Ticket): Promise<void> {
    await database.write(async () => {
      await ticket.destroyPermanently();
    });
  }

  // Sync operations
  async syncWithServer(isOnline: boolean): Promise<void> {
    if (!isOnline) return;

    try {
      // 1. Push unsynced local changes to server
      await this.pushLocalChangesToServer();

      // 2. Pull latest data from server
      await this.pullServerData();
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    }
  }

  private async pushLocalChangesToServer(): Promise<void> {
    const ticketsCollection = database.get<Ticket>("tickets");
    const unsyncedTickets = await ticketsCollection
      .query(Q.where("is_synced", false))
      .fetch();

    for (const ticket of unsyncedTickets) {
      try {
        if (!ticket.serverId) {
          // Create new ticket on server
          const serverTicket = await this.apiService.createTicket({
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
          });

          // Update local ticket with server ID
          await database.write(async () => {
            await ticket.update((record) => {
              record.serverId = serverTicket.id;
              record.isSynced = true;
            });
          });
        } else {
          // Update existing ticket on server
          await this.apiService.updateTicket(ticket.serverId, {
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
          });

          // Mark as synced
          await database.write(async () => {
            await ticket.update((record) => {
              record.isSynced = true;
            });
          });
        }
      } catch (error) {
        console.error(`Failed to sync ticket ${ticket.id}:`, error);
      }
    }
  }

  private async pullServerData(): Promise<void> {
    try {
      const serverTickets = await this.apiService.getTickets();
      const ticketsCollection = database.get<Ticket>("tickets");

      await database.write(async () => {
        for (const serverTicket of serverTickets) {
          // Check if ticket already exists locally
          const existingTickets = await ticketsCollection
            .query(Q.where("server_id", serverTicket.id))
            .fetch();

          if (existingTickets.length === 0) {
            // Create new local ticket
            await ticketsCollection.create((ticket) => {
              ticket.title = serverTicket.title;
              ticket.description = serverTicket.description;
              ticket.status = serverTicket.status as TicketStatus;
              ticket.serverId = serverTicket.id;
              ticket.isSynced = true;
            });
          } else {
            // Update existing local ticket if server version is newer
            const existingTicket = existingTickets[0];
            const serverUpdatedAt = new Date(serverTicket.updated_at).getTime();
            const localUpdatedAt = existingTicket.updatedAt.getTime();

            if (serverUpdatedAt > localUpdatedAt && existingTicket.isSynced) {
              await existingTicket.update((record) => {
                record.title = serverTicket.title;
                record.description = serverTicket.description;
                record.status = serverTicket.status as TicketStatus;
                record.isSynced = true;
              });
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to pull server data:", error);
      throw error;
    }
  }

  async getUnsyncedCount(): Promise<number> {
    const ticketsCollection = database.get<Ticket>("tickets");
    const unsyncedTickets = await ticketsCollection
      .query(Q.where("is_synced", false))
      .fetch();
    return unsyncedTickets.length;
  }
}

export const ticketService = new TicketService();
