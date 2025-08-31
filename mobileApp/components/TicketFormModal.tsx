import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Surface,
} from "react-native-paper";
import { Ticket, TicketStatus } from "@/lib/database/models/Ticket";

interface TicketFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TicketStatus;
  }) => void;
  ticket?: Ticket | null;
  initialStatus?: TicketStatus;
}

export const TicketFormModal: React.FC<TicketFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  ticket,
  initialStatus = "todo",
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TicketStatus>(initialStatus);

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description);
      setStatus(ticket.status);
    } else {
      setTitle("");
      setDescription("");
      setStatus(initialStatus);
    }
  }, [ticket, initialStatus, visible]);

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
      });
      onDismiss();
    }
  };

  const statusButtons = [
    {
      value: "todo" as TicketStatus,
      label: "To Do",
      icon: "circle-outline",
    },
    {
      value: "in_progress" as TicketStatus,
      label: "In Progress",
      icon: "clock-outline",
    },
    {
      value: "done" as TicketStatus,
      label: "Done",
      icon: "check-circle-outline",
    },
  ];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface}>
          <Text variant="headlineSmall" style={styles.title}>
            {ticket ? "Edit Ticket" : "Create New Ticket"}
          </Text>

          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="Enter ticket title"
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Enter ticket description"
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

          <View style={styles.actions}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              disabled={!title.trim() || !description.trim()}
            >
              {ticket ? "Update" : "Create"}
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    margin: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
  },
  statusLabel: {
    marginBottom: 8,
    fontWeight: "500",
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
