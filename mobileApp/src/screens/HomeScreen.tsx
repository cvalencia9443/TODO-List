import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Appbar, Snackbar, IconButton } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ticket, TicketStatus } from "@/lib/database/models/Ticket";
import { TicketColumn } from "@/components/TicketColumn";
import { TicketFormModal } from "@/components/TicketFormModal";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { LoadingScreen } from "@/components/LoadingScreen";
import { EmptyState } from "@/components/EmptyState";
import { useTickets } from "@/hooks/useTickets";

export const HomeScreen: React.FC = () => {
  const {
    tickets,
    loading,
    isOnline,
    syncing,
    createTicket,
    updateTicket,
    deleteTicket,
    handleSync,
    loadTickets,
    getTicketsByStatus,
    getUnsyncedCount,
  } = useTickets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [initialStatus, setInitialStatus] = useState<TicketStatus>("todo");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleAddTicket = (status: TicketStatus) => {
    setInitialStatus(status);
    setEditingTicket(null);
    setModalVisible(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setModalVisible(true);
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    Alert.alert(
      "Delete Ticket",
      "Are you sure you want to delete this ticket?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTicket(ticket);
              showSnackbar("Ticket deleted successfully");
            } catch (error) {
              console.error("Error deleting ticket:", error);
              showSnackbar("Error deleting ticket");
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (
    ticket: Ticket,
    newStatus: TicketStatus
  ) => {
    try {
      await updateTicket(ticket, { status: newStatus });
      showSnackbar("Ticket status updated");
    } catch (error) {
      console.error("Error updating ticket status:", error);
      showSnackbar("Error updating ticket status");
    }
  };

  const handleFormSubmit = async (data: {
    title: string;
    description: string;
    status: TicketStatus;
  }) => {
    try {
      if (editingTicket) {
        await updateTicket(editingTicket, data);
        showSnackbar("Ticket updated successfully");
      } else {
        await createTicket(data);
        showSnackbar("Ticket created successfully");
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      showSnackbar("Error saving ticket");
    }
  };

  const handleSyncPress = async () => {
    try {
      await handleSync();
      showSnackbar("Sync completed");
    } catch (error) {
      console.error("Error syncing:", error);
      showSnackbar("Error syncing with server");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTickets();
      if (isOnline) {
        await handleSync();
      }
    } catch (error) {
      console.error("Error refreshing:", error);
      showSnackbar("Error refreshing data");
    } finally {
      setRefreshing(false);
    }
  };

  const todoTickets = getTicketsByStatus("todo");
  const inProgressTickets = getTicketsByStatus("in_progress");
  const doneTickets = getTicketsByStatus("done");

  if (loading) {
    return <LoadingScreen message="Loading tickets..." />;
  }

  if (tickets.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Appbar.Header>
            <Appbar.Content title="TODO Board" />
            <ConnectionStatus
              isOnline={isOnline}
              unsyncedCount={getUnsyncedCount()}
              syncing={syncing}
            />
            <IconButton
              icon="sync"
              onPress={handleSyncPress}
              disabled={!isOnline || syncing}
            />
          </Appbar.Header>
          <EmptyState onCreateTicket={handleAddTicket} />
          <TicketFormModal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            onSubmit={handleFormSubmit}
            ticket={editingTicket}
            initialStatus={initialStatus}
          />
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {snackbarMessage}
          </Snackbar>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="TODO Board" />
          <ConnectionStatus
            isOnline={isOnline}
            unsyncedCount={getUnsyncedCount()}
            syncing={syncing}
          />
          <IconButton
            icon="sync"
            onPress={handleSyncPress}
            disabled={!isOnline || syncing}
          />
        </Appbar.Header>

        <View style={styles.board}>
          <TicketColumn
            title="To Do"
            status="todo"
            tickets={todoTickets}
            onAddTicket={handleAddTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            onStatusChange={handleStatusChange}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <TicketColumn
            title="In Progress"
            status="in_progress"
            tickets={inProgressTickets}
            onAddTicket={handleAddTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            onStatusChange={handleStatusChange}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <TicketColumn
            title="Done"
            status="done"
            tickets={doneTickets}
            onAddTicket={handleAddTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            onStatusChange={handleStatusChange}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </View>

        <TicketFormModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          onSubmit={handleFormSubmit}
          ticket={editingTicket}
          initialStatus={initialStatus}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  board: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
  },
});
