import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { TicketStatus } from "@/lib/database/models/Ticket";

interface EmptyStateProps {
  onCreateTicket: (status: TicketStatus) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateTicket }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to TODO Board
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Get started by creating your first ticket
      </Text>
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => onCreateTicket("todo")}
          style={styles.button}
          icon="plus"
        >
          Create Ticket
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f5f5f5",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    marginBottom: 32,
    textAlign: "center",
    color: "#666",
  },
  actions: {
    gap: 16,
  },
  button: {
    minWidth: 200,
  },
});
