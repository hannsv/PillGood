import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Button,
  Card,
  Switch,
  Text,
  useTheme,
  IconButton,
  Avatar,
} from "react-native-paper";

import AddPillModal, { RegisteredPill } from "../components/modal/AddPillModal";
import TopTimeBanner from "../components/banner/TopTimeBannner";
import { TimeSlot } from "../components/modal/TimeSlotSelector";

function PillListScreen() {
  const [visible, setVisible] = useState(false);
  const [screenState, setScreenState] = useState<"add" | "details">("add");
  const theme = useTheme();

  const [pillList, setPillList] = useState<RegisteredPill[]>([]);
  // 완료된 작업 목록: "pillId_slot" 형식의 문자열 배열
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

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

  const handleCompleteTask = (pillId: string, slot: TimeSlot) => {
    const key = `${pillId}_${slot}`;
    if (!completedTasks.includes(key)) {
      setCompletedTasks((prev) => [...prev, key]);
    }
  };

  // 다음 복용할 약 계산:
  // 모든 활성화된 약의 슬롯 중, 아직 완료되지 않은 가장 이른 슬롯을 찾음
  const getNextPill = (): { pill: RegisteredPill; slot: TimeSlot } | null => {
    const slotOrder: TimeSlot[] = ["morning", "lunch", "dinner", "bedtime"];

    // { pill, slot, orderIndex } 목록 생성
    const allPending: {
      pill: RegisteredPill;
      slot: TimeSlot;
      orderIndex: number;
    }[] = [];

    pillList
      .filter((p) => p.isActive)
      .forEach((pill) => {
        pill.slots.forEach((slot) => {
          const key = `${pill.id}_${slot}`;
          if (!completedTasks.includes(key)) {
            allPending.push({
              pill,
              slot,
              orderIndex: slotOrder.indexOf(slot),
            });
          }
        });
      });

    // 슬롯 순서대로 정렬
    allPending.sort((a, b) => a.orderIndex - b.orderIndex);

    if (allPending.length > 0) {
      return { pill: allPending[0].pill, slot: allPending[0].slot };
    }
    return null;
  };

  const nextTarget = getNextPill();

  const renderSlotIcons = (slots: TimeSlot[], pillId: string) => {
    const allSlots: TimeSlot[] = ["morning", "lunch", "dinner", "bedtime"];

    // 아이콘 매핑
    const icons: { [key in TimeSlot]: string } = {
      morning: "weather-sunny",
      lunch: "silverware-fork-knife",
      dinner: "weather-sunset",
      bedtime: "bed",
    };

    return (
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        {allSlots.map((slot) => {
          const isAssigned = slots.includes(slot);
          const isDone = completedTasks.includes(`${pillId}_${slot}`);

          if (!isAssigned) return null;

          return (
            <IconButton
              key={slot}
              icon={icons[slot]}
              size={20}
              iconColor={
                isDone
                  ? theme.colors.outline // 완료됨
                  : theme.colors.primary // 해야함
              }
              style={{ margin: 0, opacity: isDone ? 0.3 : 1 }}
            />
          );
        })}
      </View>
    );
  };

  const renderPillItem = ({ item }: { item: RegisteredPill }) => {
    const allDone = item.slots.every((s) =>
      completedTasks.includes(`${item.id}_${s}`),
    );

    return (
      <Card
        style={[
          styles.card,
          !item.isActive && { opacity: 0.5 },
          item.isActive && allDone && { backgroundColor: "#f0f0f0" },
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.infoContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.pillName,
                item.isActive &&
                  allDone && {
                    textDecorationLine: "line-through",
                    color: "gray",
                  },
              ]}
            >
              {item.name}
            </Text>
            {item.company && (
              <Text variant="bodySmall" style={{ color: "gray" }}>
                {item.company}
              </Text>
            )}

            {renderSlotIcons(item.slots, item.id)}

            {item.isActive && allDone && item.slots.length > 0 && (
              <Text
                variant="labelSmall"
                style={{ color: "green", marginTop: 2 }}
              >
                오늘 복용 완료
              </Text>
            )}
          </View>

          <View style={styles.settingContainer}>
            <Switch
              value={item.isActive}
              onValueChange={() => togglePillActive(item.id)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <TopTimeBanner
        nextPill={nextTarget?.pill}
        targetSlot={nextTarget?.slot}
        onComplete={(id) => {
          if (nextTarget && nextTarget.pill.id === id) {
            handleCompleteTask(id, nextTarget.slot);
          }
        }}
      />

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
