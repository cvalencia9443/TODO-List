import React, { useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Appbar,
  Card,
  Text,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  SegmentedButtons,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// Temporarily disabled WatermelonDB imports
// import { useTickets } from "@/hooks/useTickets";
// import { Ticket, TicketStatus } from "@/lib/database/models/Ticket";

export const HomeScreen: React.FC = () => {
  const {
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
    refreshTickets,
  } = useTickets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TicketStatus>("todo");
  const [refreshing, setRefreshing] = useState(false);

  const handleCreateOrUpdate = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      if (editingTicket) {
        await updateTicket(editingTicket, {
          title: title.trim(),
          description: description.trim(),
          status,
        });
      } else {
        await createTicket({
          title: title.trim(),
          description: description.trim(),
          status,
        });
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save ticket:", error);
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setTitle(ticket.title);
    setDescription(ticket.description);
    setStatus(ticket.status);
    setModalVisible(true);
  };

  const handleDeleteTicket = async (ticket: Ticket) => {
    try {
      await deleteTicket(ticket);
    } catch (error) {
      console.error("Failed to delete ticket:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setEditingTicket(null);
    setModalVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTickets();
      if (isOnline) {
        await syncTickets();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const statusButtons = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  const renderTicketCard = (ticket: Ticket) => (
    <Card key={ticket.id} style={styles.ticketCard}>
      <Card.Content>
        <View style={styles.ticketHeader}>
          <Text variant="titleSmall" style={styles.ticketTitle}>
            {ticket.title}
          </Text>
          {!ticket.isSynced && (
            <Chip size="small" mode="outlined" textStyle={styles.unsyncedChip}>
              Unsynced
            </Chip>
          )}
        </View>
        <Text variant="bodySmall" style={styles.ticketDescription}>
          {ticket.description}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="text" onPress={() => handleEditTicket(ticket)}>
          Edit
        </Button>
        <Button mode="text" onPress={() => handleDeleteTicket(ticket)}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderColumn = (
    columnStatus: TicketStatus,
    title: string,
    color: string
  ) => {
    const columnTickets = getTicketsByStatus(columnStatus);

    return (
      <View style={styles.column}>
        <Card style={[styles.columnHeader, { backgroundColor: color }]}>
          <Card.Content>
            <Text variant="titleMedium">
              {title} ({columnTickets.length})
            </Text>
          </Card.Content>
        </Card>
        <ScrollView
          style={styles.ticketList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {columnTickets.map(renderTicketCard)}
          {columnTickets.length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No tickets in {title.toLowerCase()}
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading tickets...
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="TODO Board" />
          <Appbar.Action
            icon={isOnline ? "wifi" : "wifi-off"}
            onPress={() => isOnline && syncTickets()}
            disabled={syncing}
          />
        </Appbar.Header>

        {/* Connection Status */}
        <View style={styles.statusBar}>
          <Chip
            icon={isOnline ? "wifi" : "wifi-off"}
            mode="outlined"
            style={[
              styles.statusChip,
              { backgroundColor: isOnline ? "#e8f5e8" : "#ffebee" },
            ]}
          >
            {isOnline ? "Online" : "Offline"}
          </Chip>
          {unsyncedCount > 0 && (
            <Chip
              icon="sync-alert"
              mode="outlined"
              style={[styles.statusChip, { backgroundColor: "#fff3e0" }]}
            >
              {unsyncedCount} unsynced
            </Chip>
          )}
          {syncing && (
            <Chip
              icon="sync"
              mode="outlined"
              style={[styles.statusChip, { backgroundColor: "#e3f2fd" }]}
            >
              Syncing...
            </Chip>
          )}
        </View>

        <ScrollView horizontal style={styles.board}>
          {renderColumn("todo", "To Do", "#ffebee")}
          {renderColumn("in_progress", "In Progress", "#fff3e0")}
          {renderColumn("done", "Done", "#e8f5e8")}
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        />

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={resetForm}
            contentContainerStyle={styles.modal}
          >
            <Card>
              <Card.Content>
                <Text variant="headlineSmall" style={styles.modalTitle}>
                  {editingTicket ? "Edit Ticket" : "Create New Ticket"}
                </Text>

                <TextInput
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />

                <Text variant="bodyLarge" style={styles.statusLabel}>
                  Status
                </Text>
                <SegmentedButtons
                  value={status}
                  onValueChange={(value) => setStatus(value as TicketStatus)}
                  buttons={statusButtons}
                  style={styles.segmentedButtons}
                />

                <View style={styles.modalActions}>
                  <Button mode="outlined" onPress={resetForm}>
                    Cancel
                  </Button>
                  <Button mode="contained" onPress={handleCreateOrUpdate}>
                    {editingTicket ? "Update" : "Create"}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
  },
  statusBar: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  statusChip: {
    height: 32,
  },
  board: {
    flex: 1,
    padding: 8,
  },
  column: {
    width: 300,
    marginHorizontal: 4,
  },
  columnHeader: {
    marginBottom: 8,
  },
  ticketList: {
    flex: 1,
  },
  ticketCard: {
    marginBottom: 8,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ticketTitle: {
    flex: 1,
    fontWeight: "bold",
  },
  ticketDescription: {
    color: "#666",
  },
  unsyncedChip: {
    fontSize: 10,
  },
  emptyCard: {
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  modal: {
    margin: 20,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  statusLabel: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});
