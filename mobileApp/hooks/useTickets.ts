import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Ticket, TicketStatus } from "@/lib/database/models/Ticket";
import {
  ticketService,
  CreateTicketData,
  UpdateTicketData,
} from "@/lib/services/ticketService";

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  // Load tickets from local database
  const loadTickets = useCallback(async () => {
    try {
      const localTickets = await ticketService.getLocalTickets();
      setTickets(localTickets);

      const count = await ticketService.getUnsyncedCount();
      setUnsyncedCount(count);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with server
  const syncTickets = useCallback(async () => {
    if (!isOnline || syncing) return;

    setSyncing(true);
    try {
      await ticketService.syncWithServer(isOnline);
      await loadTickets(); // Reload after sync
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing, loadTickets]);

  // Create new ticket
  const createTicket = useCallback(
    async (data: CreateTicketData) => {
      try {
        await ticketService.createLocalTicket(data);
        await loadTickets();

        // Try to sync immediately if online
        if (isOnline) {
          syncTickets();
        }
      } catch (error) {
        console.error("Failed to create ticket:", error);
        throw error;
      }
    },
    [loadTickets, isOnline, syncTickets]
  );

  // Update ticket
  const updateTicket = useCallback(
    async (ticket: Ticket, data: UpdateTicketData) => {
      try {
        await ticketService.updateLocalTicket(ticket, data);
        await loadTickets();

        // Try to sync immediately if online
        if (isOnline) {
          syncTickets();
        }
      } catch (error) {
        console.error("Failed to update ticket:", error);
        throw error;
      }
    },
    [loadTickets, isOnline, syncTickets]
  );

  // Delete ticket
  const deleteTicket = useCallback(
    async (ticket: Ticket) => {
      try {
        await ticketService.deleteLocalTicket(ticket);
        await loadTickets();
      } catch (error) {
        console.error("Failed to delete ticket:", error);
        throw error;
      }
    },
    [loadTickets]
  );

  // Get tickets by status
  const getTicketsByStatus = useCallback(
    (status: TicketStatus) => {
      return tickets.filter((ticket) => ticket.status === status);
    },
    [tickets]
  );

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected ?? false;

      setIsOnline(isNowOnline);

      // Auto-sync when coming back online
      if (wasOffline && isNowOnline) {
        syncTickets();
      }
    });

    return unsubscribe;
  }, [isOnline, syncTickets]);

  // Initial load
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    tickets,
    loading,
    isOnline,
    syncing,
    unsyncedCount,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketsByStatus,
    syncTickets,
    refreshTickets: loadTickets,
  };
};
