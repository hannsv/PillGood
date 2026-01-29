import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  TextInput,
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
  Portal,
  Dialog,
  TextInput as PaperTextInput,
} from "react-native-paper";
// import { useFocusEffect } from "@react-navigation/native"; // 내비게이션 라이브러리 미사용으로 제거

import AddPillModal, {
  RegisteredPill,
} from "../components/add-pill/AddPillModal";
import TopTimeBanner from "../components/home/TopTimeBanner";
import { TimeSlot } from "../components/common/TimeSlotSelector";
import { DayOfWeek } from "../components/common/DaySelector";
import DayFilterBar, { FilterDayKey } from "../components/home/DayFilterBar";
import {
  addPillToDB,
  getPillsFromDB,
  deletePillFromDB,
  togglePillActiveDB,
  addPillHistory,
  getTodayCompletedTasks,
  updatePillGroupTitle,
} from "../api/database";
import { eventBus } from "../utils/eventBus";

function PillListScreen() {
  const [visible, setVisible] = useState(false);

  // 편집 모드 관련 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [targetRenameId, setTargetRenameId] = useState<string | null>(null);

  const theme = useTheme();

  const [pillList, setPillList] = useState<RegisteredPill[]>([]);

  // 이름 변경 다이얼로그 열기
  const openRenameDialog = (id: string, currentName: string) => {
    setTargetRenameId(id);
    setRenameText(currentName);
    setRenameDialogVisible(true);
  };

  // 이름 변경 실행
  const handleRename = async () => {
    if (!targetRenameId || renameText.trim() === "") {
      setRenameDialogVisible(false);
      return;
    }
    try {
      await updatePillGroupTitle(targetRenameId, renameText);
      await loadPills();
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "이름 수정에 실패했습니다.");
    } finally {
      setRenameDialogVisible(false);
      setTargetRenameId(null);
    }
  };

  // 오늘 요일로 초기값 설정
  const [filterDay, setFilterDay] = useState<FilterDayKey>(() => {
    const dayMap: { [key: number]: string } = {
      0: "Sun",
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
    };
    return dayMap[new Date().getDay()] as FilterDayKey;
  });

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
    // 알림 끄는 경우에만 확인
    if (currentStatus) {
      Alert.alert("알림 끄기", "이 약의 복용 알림을 끄시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "끄기",
          onPress: async () => {
            // UI 낙관적 업데이트
            setPillList((prev) =>
              prev.map((pill) =>
                pill.id === id ? { ...pill, isActive: !pill.isActive } : pill,
              ),
            );
            // DB 업데이트
            await togglePillActiveDB(id, !currentStatus);
          },
        },
      ]);
    } else {
      // 켜는 건 바로 실행
      setPillList((prev) =>
        prev.map((pill) =>
          pill.id === id ? { ...pill, isActive: !pill.isActive } : pill,
        ),
      );
      await togglePillActiveDB(id, !currentStatus);
    }
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

    // 1. 슬롯 정렬
    const sortedSlots = [...slots].sort(
      (a, b) => slotOrder.indexOf(a) - slotOrder.indexOf(b),
    );

    // 2. 아직 완료되지 않은 첫 번째 슬롯 찾기
    const nextSlotIndex = sortedSlots.findIndex(
      (slot) => !completedTasks.includes(`${pillId}_${slot}`),
    );

    // 3. 모든 슬롯이 완료된 경우
    if (nextSlotIndex === -1 && sortedSlots.length > 0) {
      return (
        <View style={{ marginTop: 12, width: "100%" }}>
          <View
            style={{
              width: "100%",
              backgroundColor: "#E8F5E9",
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start", // 왼쪽 정렬로 변경
              borderWidth: 1,
              borderColor: "#C8E6C9",
              minHeight: 80,
              elevation: 0,
            }}
          >
            <View
              style={{
                backgroundColor: "#C8E6C9",
                borderRadius: 20,
                padding: 8,
                marginRight: 12,
              }}
            >
              <Icon source="check-bold" color="#2E7D32" size={24} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                variant="titleMedium"
                style={{
                  color: "#2E7D32",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                오늘 복용 완료
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: "#2E7D32",
                  opacity: 0.8,
                }}
              >
                내일도 잊지 마세요!
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // 4. 다음 복용할 슬롯이 있는 경우
    const currentSlot = sortedSlots[nextSlotIndex];

    return (
      <View style={{ marginTop: 12, width: "100%" }}>
        <TouchableOpacity
          onPress={() => handleCompleteTask(pillId, currentSlot)}
          style={{
            width: "100%",
            backgroundColor: theme.colors.primaryContainer,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            elevation: 2,
            minHeight: 80, // 최소 높이 강제 지정으로 크기 통일
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 20,
                padding: 8,
                marginRight: 12,
              }}
            >
              <Icon source="pill" color={theme.colors.onPrimary} size={24} />
            </View>
            <View>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                {slotLabels[currentSlot]} 복용하기
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onPrimaryContainer, opacity: 0.7 }}
              >
                진행 상황: {nextSlotIndex} / {sortedSlots.length}
              </Text>
            </View>
          </View>
          <Icon
            source="chevron-right"
            size={28}
            color={theme.colors.onPrimaryContainer}
          />
        </TouchableOpacity>
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
          <View style={{ width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    variant="headlineSmall"
                    style={[
                      styles.pillName,
                      item.isActive &&
                        allDone && {
                          textDecorationLine: "line-through",
                          color: "gray",
                        },
                      { flexShrink: 1 },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>

                {item.pillNames && item.pillNames.length > 0 && (
                  <Text
                    variant="titleSmall"
                    style={{
                      color: theme.colors.primary,
                      marginTop: 4,
                      fontWeight: "bold",
                    }}
                  >
                    먹을 약 : {item.pillNames.join(", ")}
                  </Text>
                )}
                {/* 제조사명 제거 */}
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 4,
                  }}
                >
                  요일 : {getDaysLabel(item.days)}
                </Text>
              </View>

              {/* 설정 버튼 영역 */}
              <View
                style={{
                  alignItems: "flex-end",
                  flexDirection: "column",
                  minWidth: isEditMode ? 100 : 40,
                }}
              >
                {isEditMode ? (
                  <View style={{ gap: 4 }}>
                    <Button
                      mode="outlined"
                      icon="pencil"
                      compact
                      contentStyle={{ flexDirection: "row-reverse" }}
                      onPress={() => openRenameDialog(item.id, item.name)}
                    >
                      이름 변경
                    </Button>
                    <Button
                      mode="contained"
                      icon="delete"
                      buttonColor={theme.colors.error}
                      compact
                      contentStyle={{ flexDirection: "row-reverse" }}
                      onPress={() => handleDeletePill(item.id)}
                    >
                      약 삭제
                    </Button>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => togglePillActive(item.id, item.isActive)}
                    style={{
                      padding: 8,
                      marginBottom: 4,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: item.isActive
                        ? theme.colors.elevation.level1
                        : "transparent",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text
                      variant="labelMedium"
                      style={{
                        color: item.isActive
                          ? theme.colors.primary
                          : theme.colors.onSurfaceDisabled,
                        marginRight: 8,
                        fontWeight: "bold",
                      }}
                    >
                      {item.isActive ? "켜짐" : "꺼짐"}
                    </Text>
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
                )}
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

      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            내 약 목록
          </Text>
          <Button
            mode={isEditMode ? "contained-tonal" : "text"}
            onPress={() => setIsEditMode(!isEditMode)}
            compact
          >
            {isEditMode ? "편집 완료" : "목록 편집"}
          </Button>
        </View>
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
          data={pillList
            .filter((p) => {
              if (!filterDay) return true;
              // 요일 지정이 없거나 빈 배열이면 '매일' -> 항상 표시
              if (!p.days || p.days.length === 0) return true;
              return p.days.includes(filterDay);
            })
            .sort((a, b) => {
              // 완료 여부 기준 정렬 (미완료가 위로)
              const aDone = a.slots.every((s) =>
                completedTasks.includes(`${a.id}_${s}`),
              );
              const bDone = b.slots.every((s) =>
                completedTasks.includes(`${b.id}_${s}`),
              );
              if (aDone === bDone) return 0;
              return aDone ? 1 : -1;
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

      <Portal>
        <Dialog
          visible={renameDialogVisible}
          onDismiss={() => setRenameDialogVisible(false)}
        >
          <Dialog.Title>이름 수정</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label="그룹 이름"
              value={renameText}
              onChangeText={setRenameText}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRenameDialogVisible(false)}>취소</Button>
            <Button onPress={handleRename}>확인</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
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
