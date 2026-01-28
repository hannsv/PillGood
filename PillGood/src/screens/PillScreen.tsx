import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Card,
  Switch,
  Text,
  useTheme,
  IconButton,
  Avatar,
  FAB,
  Icon,
  Divider,
} from "react-native-paper";
// import { useFocusEffect } from "@react-navigation/native"; // 내비게이션 라이브러리 미사용으로 제거

import AddPillModal, { RegisteredPill } from "../components/modal/AddPillModal";
import TopTimeBanner from "../components/banner/TopTimeBannner";
import { TimeSlot } from "../components/modal/TimeSlotSelector";
import { DayOfWeek } from "../components/modal/DaySelector";
import DayFilterBar, { FilterDayKey } from "../components/nav/DayFilterBar";
import {
  addPillToDB,
  getPillsFromDB,
  deletePillFromDB,
  togglePillActiveDB,
  addPillHistory,
  getTodayCompletedTasks,
} from "../api/database";
import { eventBus } from "../utils/eventBus";

function PillListScreen() {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const [pillList, setPillList] = useState<RegisteredPill[]>([]);
  const [filterDay, setFilterDay] = useState<FilterDayKey>(null);
  // 완료된 작업 목록: "pillId_slot" 형식의 문자열 배열
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // DB에서 데이터 로드
  const loadPills = async () => {
    const pills = await getPillsFromDB();
    setPillList(pills);
    const completed = await getTodayCompletedTasks();
    setCompletedTasks(completed);
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

  const handleAddPill = async (newPills: RegisteredPill[]) => {
    // DB 저장
    await addPillToDB(newPills);
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

  const handleCompleteTask = async (pillId: string, slot: TimeSlot) => {
    const key = `${pillId}_${slot}`;
    if (!completedTasks.includes(key)) {
      setCompletedTasks((prev) => [...prev, key]);
      await addPillHistory(pillId, slot);
      eventBus.emit("history_updated"); // 기록 업데이트 이벤트 발생
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

  // 오늘 복용해야 할 약이 하나라도 있는지 확인 (완료 여부 상관없이)
  const hasPillsToday = () => {
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

    return pillList.some((pill) => {
      if (!pill.isActive) return false;
      // 매일 복용이거나 오늘 요일이 포함된 경우
      const isToday =
        !pill.days ||
        pill.days.length === 0 ||
        pill.days.includes(todayKey as any);
      return isToday && pill.slots.length > 0;
    });
  };

  const nextTarget = getNextPill();

  const renderSlotIcons = (slots: TimeSlot[], pillId: string) => {
    const slotLabels: { [key in TimeSlot]: string } = {
      morning: "아침",
      lunch: "점심",
      dinner: "저녁",
      bedtime: "자기전",
    };
    const slotOrder: TimeSlot[] = ["morning", "lunch", "dinner", "bedtime"];

    // 슬롯 정렬
    const sortedSlots = [...slots].sort(
      (a, b) => slotOrder.indexOf(a) - slotOrder.indexOf(b),
    );

    return (
      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {sortedSlots.map((slot) => {
          const isDone = completedTasks.includes(`${pillId}_${slot}`);
          return (
            <View
              key={slot}
              style={{
                width: sortedSlots.length === 1 ? "100%" : "48%", // 1개일 땐 꽉 차게, 아니면 2열
                backgroundColor: isDone ? "#f0f0f0" : "white",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDone
                  ? "transparent"
                  : theme.colors.outlineVariant,
                padding: 12,
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  marginBottom: 12,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  variant="titleMedium"
                  style={{
                    color: isDone ? theme.colors.outline : theme.colors.primary,
                    fontWeight: "bold",
                  }}
                >
                  {slotLabels[slot]}
                </Text>
              </View>

              {isDone ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                    width: "100%",
                  }}
                >
                  <Icon
                    source="check-bold"
                    color={theme.colors.secondary}
                    size={20}
                  />
                  <Text
                    variant="labelMedium"
                    style={{
                      marginLeft: 4,
                      color: theme.colors.secondary,
                      fontWeight: "bold",
                    }}
                  >
                    완료
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleCompleteTask(pillId, slot)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: 20,
                    paddingVertical: 8,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Text
                    variant="labelMedium"
                    style={{
                      color: theme.colors.onPrimary,
                      fontWeight: "bold",
                    }}
                  >
                    복용
                  </Text>
                </TouchableOpacity>
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
          <View style={{ flexDirection: "column" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  variant="headlineSmall"
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
                {item.pillNames && item.pillNames.length > 0 && (
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                    }}
                  >
                    포함: {item.pillNames.join(", ")}
                  </Text>
                )}
                {item.company && (
                  <Text
                    variant="bodyMedium"
                    style={{ color: "gray", marginTop: 4 }}
                  >
                    {item.company}
                  </Text>
                )}
                <Text
                  variant="titleSmall"
                  style={{
                    color: theme.colors.primary,
                    marginTop: 4,
                    fontWeight: "bold",
                  }}
                >
                  {getDaysLabel(item.days)}
                </Text>
              </View>

              {/* 설정 버튼 영역 */}
              <View style={{ alignItems: "flex-end", flexDirection: "column" }}>
                <TouchableOpacity
                  onPress={() => togglePillActive(item.id, item.isActive)}
                  style={{ padding: 8, marginBottom: 4 }}
                >
                  <Icon
                    source={item.isActive ? "bell-ring" : "bell-off"}
                    color={
                      item.isActive
                        ? theme.colors.primary
                        : theme.colors.onSurfaceDisabled
                    }
                    size={24}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePill(item.id)}
                  style={{ padding: 8 }}
                >
                  <Icon
                    source="trash-can-outline"
                    color={theme.colors.error}
                    size={24}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Divider style={{ marginBottom: 16, marginTop: 8 }} />

            {/* 시간대별 리스트 */}
            <View>{renderSlotIcons(item.slots, item.id)}</View>
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
        hasPillsToday={hasPillsToday()}
        onComplete={(id) => {
          if (nextTarget && nextTarget.pill.id === id) {
            handleCompleteTask(id, nextTarget.slot);
          }
        }}
      />

      <View style={{ paddingHorizontal: 15 }}>
        <DayFilterBar selectedDay={filterDay} onSelect={setFilterDay} />
      </View>

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
          data={pillList.filter((p) => {
            if (!filterDay) return true;
            // 요일 지정이 없거나 빈 배열이면 '매일' -> 항상 표시
            if (!p.days || p.days.length === 0) return true;
            return p.days.includes(filterDay);
          })}
          keyExtractor={(item) => item.id}
          renderItem={renderPillItem}
          contentContainerStyle={styles.listContent}
          style={{ width: "100%" }}
        />
      )}

      <FAB
        icon="plus"
        label="약 추가"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        color={theme.colors.onTertiary}
        onPress={() => setVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 10,
    elevation: 6,
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
    paddingVertical: 8, // 상하 여백 추가
  },
  infoContainer: {
    flex: 1,
    marginRight: 20, // 간격 확대 (10 -> 20)
  },
  pillName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  settingContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 110,
  },
  settingGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default PillListScreen;
