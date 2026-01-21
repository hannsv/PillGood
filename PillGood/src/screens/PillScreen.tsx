import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Button,
  Card,
  Switch,
  Text,
  useTheme,
  IconButton,
} from "react-native-paper";

import AddPillModal, { RegisteredPill } from "../components/modal/AddPillModal";

function PillListScreen() {
  const [visible, setVisible] = useState(false);
  const [screenState, setScreenState] = useState<"add" | "details">("add");
  const theme = useTheme();

  const [pillList, setPillList] = useState<RegisteredPill[]>([]);

  const handleAddPill = (newPill: RegisteredPill) => {
    setPillList((prev) => [...prev, newPill]);
    setVisible(false);
  };

  const togglePillActive = (id: string) => {
    setPillList((prev) =>
      prev.map((pill) =>
        pill.id === id ? { ...pill, isActive: !pill.isActive } : pill,
      ),
    );
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "오후" : "오전";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${ampm} ${displayHours}:${displayMinutes}`;
  };

  const renderPillItem = ({ item }: { item: RegisteredPill }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text variant="titleMedium" style={styles.pillName}>
            {item.name}
          </Text>
          {item.company && (
            <Text variant="bodySmall" style={{ color: "gray" }}>
              {item.company}
            </Text>
          )}
        </View>

        <View style={styles.settingContainer}>
          <Text
            variant="headlineMedium"
            style={{ color: theme.colors.primary }}
          >
            {formatTime(item.time)}
          </Text>
          <Switch
            value={item.isActive}
            onValueChange={() => togglePillActive(item.id)}
            style={{ marginTop: 5 }}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <AddPillModal
        visible={visible}
        onDismiss={() => setVisible(false)}
        onAddPill={handleAddPill}
      />

      {pillList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ marginBottom: 20 }}>등록된 알림이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={pillList}
          keyExtractor={(item) => item.id}
          renderItem={renderPillItem}
          contentContainerStyle={styles.listContent}
          style={{ width: "100%" }}
        />
      )}

      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          onPress={() => setVisible(true)}
          icon="plus"
          style={styles.addButton}
        >
          약 추가하기
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // 버튼 공간 확보
  },
  card: {
    marginBottom: 15,
    backgroundColor: "white",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  pillName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  settingContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 100,
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addButton: {
    borderRadius: 30,
    paddingHorizontal: 20,
  },
});

export default PillListScreen;
