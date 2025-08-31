import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  createdAt: Date;
  updatedAt: Date;
}

export const SimpleHomeScreen: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");

  const handleCreateOrUpdate = () => {
    if (!title.trim() || !description.trim()) return;

    if (editingTicket) {
      // Update existing ticket
      setTickets(
        tickets.map((ticket) =>
          ticket.id === editingTicket.id
            ? {
                ...ticket,
                title: title.trim(),
                description: description.trim(),
                status,
                updatedAt: new Date(),
              }
            : ticket
        )
      );
    } else {
      // Create new ticket
      const now = new Date();
      const newTicket: Ticket = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        status,
        createdAt: now,
        updatedAt: now,
      };
      setTickets([...tickets, newTicket]);
    }

    resetForm();
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setTitle(ticket.title);
    setDescription(ticket.description);
    setStatus(ticket.status);
    setModalVisible(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setEditingTicket(null);
    setModalVisible(false);
  };

  const getTicketsByStatus = (
    ticketStatus: "todo" | "in_progress" | "done"
  ) => {
    return tickets.filter((ticket) => ticket.status === ticketStatus);
  };

  const statusButtons = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="TODO Board" />
        </Appbar.Header>

        <ScrollView horizontal style={styles.board}>
          {/* To Do Column */}
          <View style={styles.column}>
            <Card style={[styles.columnHeader, { backgroundColor: "#ffebee" }]}>
              <Card.Content>
                <Text variant="titleMedium">
                  To Do ({getTicketsByStatus("todo").length})
                </Text>
              </Card.Content>
            </Card>
            <ScrollView style={styles.ticketList}>
              {getTicketsByStatus("todo").map((ticket) => (
                <Card key={ticket.id} style={styles.ticketCard}>
                  <Card.Content>
                    <Text variant="titleSmall">{ticket.title}</Text>
                    <Text variant="bodySmall">{ticket.description}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="text"
                      onPress={() => handleEditTicket(ticket)}
                    >
                      Edit
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleDeleteTicket(ticket.id)}
                    >
                      Delete
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
              {getTicketsByStatus("todo").length === 0 && (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No tasks in To Do
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </ScrollView>
          </View>

          {/* In Progress Column */}
          <View style={styles.column}>
            <Card style={[styles.columnHeader, { backgroundColor: "#fff3e0" }]}>
              <Card.Content>
                <Text variant="titleMedium">
                  In Progress ({getTicketsByStatus("in_progress").length})
                </Text>
              </Card.Content>
            </Card>
            <ScrollView style={styles.ticketList}>
              {getTicketsByStatus("in_progress").map((ticket) => (
                <Card key={ticket.id} style={styles.ticketCard}>
                  <Card.Content>
                    <Text variant="titleSmall">{ticket.title}</Text>
                    <Text variant="bodySmall">{ticket.description}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="text"
                      onPress={() => handleEditTicket(ticket)}
                    >
                      Edit
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleDeleteTicket(ticket.id)}
                    >
                      Delete
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
              {getTicketsByStatus("in_progress").length === 0 && (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No tasks in progress
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </ScrollView>
          </View>

          {/* Done Column */}
          <View style={styles.column}>
            <Card style={[styles.columnHeader, { backgroundColor: "#e8f5e8" }]}>
              <Card.Content>
                <Text variant="titleMedium">
                  Done ({getTicketsByStatus("done").length})
                </Text>
              </Card.Content>
            </Card>
            <ScrollView style={styles.ticketList}>
              {getTicketsByStatus("done").map((ticket) => (
                <Card key={ticket.id} style={styles.ticketCard}>
                  <Card.Content>
                    <Text variant="titleSmall">{ticket.title}</Text>
                    <Text variant="bodySmall">{ticket.description}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="text"
                      onPress={() => handleEditTicket(ticket)}
                    >
                      Edit
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleDeleteTicket(ticket.id)}
                    >
                      Delete
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
              {getTicketsByStatus("done").length === 0 && (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                      No completed tasks
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </ScrollView>
          </View>
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        />

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
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
                  onValueChange={(value) => setStatus(value as any)}
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
