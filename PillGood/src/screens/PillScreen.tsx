import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
  Button,
  Card,
  Switch,
  Text,
  useTheme,
  IconButton,
  Avatar,
} from "react-native-paper";
// import { useFocusEffect } from "@react-navigation/native"; // 내비게이션 라이브러리 미사용으로 제거

import AddPillModal, { RegisteredPill } from "../components/modal/AddPillModal";
import TopTimeBanner from "../components/banner/TopTimeBannner";
import { TimeSlot } from "../components/modal/TimeSlotSelector";
import { DayOfWeek } from "../components/modal/DaySelector";
import {
  addPillToDB,
  getPillsFromDB,
  deletePillFromDB,
  togglePillActiveDB,
} from "../api/database";

function PillListScreen() {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const [pillList, setPillList] = useState<RegisteredPill[]>([]);
  // 완료된 작업 목록: "pillId_slot" 형식의 문자열 배열
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // DB에서 데이터 로드
  const loadPills = async () => {
    const pills = await getPillsFromDB();
    setPillList(pills);
  };

  // 초기 로딩
  useEffect(() => {
    loadPills();
  }, []);

  // 화면 포커스 될 때마다 데이터 새로고침 (Nav 없이 Paper Nav 사용중이므로 useEffect로 대체)
  // useFocusEffect(
  //   useCallback(() => {
  //     loadPills();
  //   }, [])
  // );

  const handleAddPill = async (newPill: RegisteredPill) => {
    // DB 저장
    await addPillToDB(newPill);
    // 목록 갱신
    await loadPills();
    setVisible(false);
  };

  const togglePillActive = async (id: string, currentStatus: boolean) => {
    // UI 낙관적 업데이트
    setPillList((prev) =>
      prev.map((pill) =>
        pill.id === id ? { ...pill, isActive: !pill.isActive } : pill,
      ),
    );
    // DB 업데이트
    await togglePillActiveDB(id, !currentStatus);
  };

  const handleDeletePill = (id: string) => {
    Alert.alert("약 삭제", "정말로 이 약을 목록에서 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deletePillFromDB(id);
          await loadPills();
        },
      },
    ]);
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

    // 현재 요일 구하기 (0: Sun, 1: Mon, ...)
    const dayMap: { [key: number]: string } = {
      0: "Sun",
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
    };
    const todayKey = dayMap[new Date().getDay()];

    // { pill, slot, orderIndex } 목록 생성
    const allPending: {
      pill: RegisteredPill;
      slot: TimeSlot;
      orderIndex: number;
    }[] = [];

    pillList
      .filter((p) => p.isActive)
      .forEach((pill) => {
        // 요일 체크: days가 있고 비어있지 않은 경우, 오늘 요일이 포함되어야 함
        // days가 undefined거나 빈 배열이면 매일 복용으로 간주
        if (
          pill.days &&
          pill.days.length > 0 &&
          !pill.days.includes(todayKey as any)
        ) {
          return;
        }

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
            <View key={slot}>
              <IconButton
                icon={icons[slot]}
                size={20}
                iconColor={
                  isDone ? theme.colors.surfaceVariant : theme.colors.primary
                }
                style={{ margin: 0 }}
              />
              {isDone && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    icon="check-bold"
                    size={28}
                    iconColor="green"
                    style={{ margin: 0 }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const getDaysLabel = (days?: DayOfWeek[]) => {
    if (!days || days.length === 0) return "매일";

    const dayLabels: { [key: string]: string } = {
      Mon: "월",
      Tue: "화",
      Wed: "수",
      Thu: "목",
      Fri: "금",
      Sat: "토",
      Sun: "일",
    };
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sorted = [...days].sort(
      (a, b) => order.indexOf(a as string) - order.indexOf(b as string),
    );

    return sorted.map((d) => dayLabels[d as string] || d).join(", ");
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

            <Text
              variant="bodySmall"
              style={{ color: theme.colors.primary, marginTop: 4 }}
            >
              {getDaysLabel(item.days)}
            </Text>

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
              onValueChange={() => togglePillActive(item.id, item.isActive)}
            />
            <IconButton
              icon="trash-can-outline"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => handleDeletePill(item.id)}
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
