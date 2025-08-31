import React from "react";
import { View, StyleSheet } from "react-native";
import { Chip, Text } from "react-native-paper";

interface ConnectionStatusProps {
  isOnline: boolean;
  unsyncedCount: number;
  syncing: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline,
  unsyncedCount,
  syncing,
}) => {
  if (syncing) {
    return (
      <View style={styles.container}>
        <Chip
          icon="sync"
          style={styles.syncingChip}
          textStyle={styles.syncingText}
          compact
        >
          Syncing...
        </Chip>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={styles.container}>
        <Chip
          icon="wifi-off"
          style={styles.offlineChip}
          textStyle={styles.offlineText}
          compact
        >
          Offline
        </Chip>
        {unsyncedCount > 0 && (
          <Text style={styles.unsyncedText}>
            {unsyncedCount} unsynced item{unsyncedCount !== 1 ? "s" : ""}
          </Text>
        )}
      </View>
    );
  }

  if (unsyncedCount > 0) {
    return (
      <View style={styles.container}>
        <Chip
          icon="cloud-sync"
          style={styles.pendingChip}
          textStyle={styles.pendingText}
          compact
        >
          {unsyncedCount} pending
        </Chip>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Chip
        icon="wifi"
        style={styles.onlineChip}
        textStyle={styles.onlineText}
        compact
      >
        Online
      </Chip>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 8,
  },
  onlineChip: {
    backgroundColor: "#e8f5e8",
    height: 28,
  },
  onlineText: {
    color: "#2e7d32",
    fontSize: 12,
  },
  offlineChip: {
    backgroundColor: "#ffebee",
    height: 28,
  },
  offlineText: {
    color: "#c62828",
    fontSize: 12,
  },
  syncingChip: {
    backgroundColor: "#e3f2fd",
    height: 28,
  },
  syncingText: {
    color: "#1565c0",
    fontSize: 12,
  },
  pendingChip: {
    backgroundColor: "#fff3e0",
    height: 28,
  },
  pendingText: {
    color: "#ef6c00",
    fontSize: 12,
  },
  unsyncedText: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
  },
});
