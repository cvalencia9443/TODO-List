import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, Surface, FAB } from "react-native-paper";
import { Ticket, TicketStatus } from "@/lib/database/models/Ticket";
import { TicketCard } from "@/components/TicketCard";

interface TicketColumnProps {
  title: string;
  status: TicketStatus;
  tickets: Ticket[];
  onAddTicket: (status: TicketStatus) => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: TicketStatus) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

export const TicketColumn: React.FC<TicketColumnProps> = ({
  title,
  status,
  tickets,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onStatusChange,
  onRefresh,
  refreshing = false,
}) => {
  const getColumnColor = (status: TicketStatus) => {
    switch (status) {
      case "todo":
        return "#ffebee";
      case "in_progress":
        return "#fff3e0";
      case "done":
        return "#e8f5e8";
      default:
        return "#f5f5f5";
    }
  };

  const getHeaderColor = (status: TicketStatus) => {
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

  return (
    <Surface
      style={[styles.column, { backgroundColor: getColumnColor(status) }]}
    >
      <View
        style={[styles.header, { backgroundColor: getHeaderColor(status) }]}
      >
        <Text variant="titleMedium" style={styles.headerText}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.count}>
          {tickets.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onEdit={onEditTicket}
            onDelete={onDeleteTicket}
            onStatusChange={onStatusChange}
          />
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        size="small"
        style={[styles.fab, { backgroundColor: getHeaderColor(status) }]}
        onPress={() => onAddTicket(status)}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
    position: "relative",
  },
  header: {
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
  },
  count: {
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});
