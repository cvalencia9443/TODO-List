import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, Chip } from "react-native-paper";
import { Ticket } from "@/lib/database/models/Ticket";

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onStatusChange: (
    ticket: Ticket,
    newStatus: "todo" | "in_progress" | "done"
  ) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#f44336";
      case "in_progress":
        return "#ff9800";
      case "done":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "todo":
        return "in_progress";
      case "in_progress":
        return "done";
      case "done":
        return "todo";
      default:
        return "todo";
    }
  };

  const handleStatusToggle = () => {
    const nextStatus = getNextStatus(ticket.status);
    onStatusChange(ticket, nextStatus as "todo" | "in_progress" | "done");
  };

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {ticket.title}
            </Text>
            {!ticket.isSynced && (
              <Chip
                icon="cloud-off-outline"
                style={styles.offlineChip}
                textStyle={styles.offlineChipText}
                compact
              >
                Offline
              </Chip>
            )}
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(ticket)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => onDelete(ticket)}
            />
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.description}>
          {ticket.description}
        </Text>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleStatusToggle}>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(ticket.status) },
              ]}
              textStyle={styles.statusChipText}
            >
              {getStatusLabel(ticket.status)}
            </Chip>
          </TouchableOpacity>

          <Text variant="bodySmall" style={styles.timestamp}>
            {new Date(ticket.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  title: {
    fontWeight: "bold",
    marginRight: 8,
  },
  offlineChip: {
    backgroundColor: "#ffecb3",
    height: 24,
  },
  offlineChipText: {
    fontSize: 10,
    color: "#f57f17",
  },
  actions: {
    flexDirection: "row",
  },
  description: {
    marginBottom: 12,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  timestamp: {
    color: "#999",
  },
});
