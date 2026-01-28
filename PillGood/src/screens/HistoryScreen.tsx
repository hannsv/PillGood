import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, SectionList, RefreshControl } from "react-native";
import { Text, Card, Avatar, useTheme } from "react-native-paper";
import { getAllHistory, HistoryItem } from "../api/database";
import { eventBus } from "../utils/eventBus";

interface SectionData {
  title: string;
  data: HistoryItem[];
}

export default function HistoryScreen() {
  const theme = useTheme();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    const rawData = await getAllHistory();

    // 데이터 가공: 날짜별 그룹화
    const grouped: { [key: string]: HistoryItem[] } = {};

    rawData.forEach((item) => {
      const date = new Date(item.takenAt);
      const dateKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    const result: SectionData[] = Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));

    setSections(result);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadHistory();

    // 이벤트 리스너 등록
    const onHistoryUpdate = () => {
      loadHistory();
    };
    eventBus.on("history_updated", onHistoryUpdate);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      eventBus.off("history_updated", onHistoryUpdate);
    };
  }, []);

  const getSlotLabel = (slot: string) => {
    const map: { [key: string]: string } = {
      morning: "아침",
      lunch: "점심",
      dinner: "저녁",
      bedtime: "자기전",
    };
    return map[slot] || slot;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? "오후" : "오전";
    const formattedHour = hour % 12 || 12; // 0시는 12시로 표시
    return `${ampm} ${formattedHour}:${minute.toString().padStart(2, "0")}`;
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.cardContent}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar.Icon
            size={32}
            icon="check"
            style={{ backgroundColor: theme.colors.secondaryContainer }}
            color={theme.colors.onSecondaryContainer}
          />
          <View style={{ marginLeft: 12 }}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {item.pillName}
            </Text>
            <Text variant="bodySmall" style={{ color: "gray" }}>
              {getSlotLabel(item.slot)} 복용
            </Text>
          </View>
        </View>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {formatTime(item.takenAt)}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={styles.header}>
      <Text
        variant="titleMedium"
        style={{ color: theme.colors.onSurfaceVariant, fontWeight: "bold" }}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Avatar.Icon
            size={64}
            icon="history"
            style={{ backgroundColor: "#e0e0e0", marginBottom: 16 }}
          />
          <Text variant="bodyLarge" style={{ color: "gray" }}>
            아직 복용 기록이 없습니다.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 4,
  },
  card: {
    marginBottom: 8,
    backgroundColor: "white",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
});
