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
  // 오늘 복용 완료한 약 ID 목록 (실제 앱에서는 날짜별로 관리 필요)
  const [completedPills, setCompletedPills] = useState<string[]>([]);

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

  const handleCompletePill = (id: string) => {
    setCompletedPills((prev) => [...prev, id]);
  };

  // 다음 복용할 약 계산 (슬롯 기반으로 단순화)
  // 실제 구현시에는 '현재 시간'과 '슬롯의 시간'을 비교해야 합니다.
  const getNextPill = (): RegisteredPill | null => {
    // 1. 활성화되어 있고 && 아직 복용하지 않은 약 필터링
    const candidates = pillList.filter(
      (pill) => pill.isActive && !completedPills.includes(pill.id),
    );

    if (candidates.length === 0) return null;

    // TODO: 정확한 시간 비교 로직 필요. 지금은 단순히 리스트 첫번째
    return candidates[0];
  };

  const nextPill = getNextPill();

  const renderSlotIcons = (slots: TimeSlot[], isCompleted: boolean) => {
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
          const isActive = slots.includes(slot);
          return (
            <IconButton
              key={slot}
              icon={icons[slot]}
              size={20}
              iconColor={
                isActive
                  ? isCompleted
                    ? theme.colors.outline // 완료되었으면 흐리게
                    : theme.colors.primary // 할당된 슬롯은 primary
                  : theme.colors.surfaceVariant // 할당 안된 슬롯은 연하게
              }
              style={{ margin: 0, opacity: isActive ? 1 : 0.3 }}
            />
          );
        })}
      </View>
    );
  };

  const renderPillItem = ({ item }: { item: RegisteredPill }) => {
    const isCompleted = completedPills.includes(item.id);

    return (
      <Card
        style={[
          styles.card,
          isCompleted && { backgroundColor: "#f0f0f0", opacity: 0.6 },
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.infoContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.pillName,
                isCompleted && { textDecorationLine: "line-through" },
              ]}
            >
              {item.name}
            </Text>
            {item.company && (
              <Text variant="bodySmall" style={{ color: "gray" }}>
                {item.company}
              </Text>
            )}

            {/* 시간 슬롯 아이콘 표시 */}
            {renderSlotIcons(item.slots, isCompleted)}

            {isCompleted && (
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary, marginTop: 4 }}
              >
                오늘 복용 완료
              </Text>
            )}
          </View>

          <View style={styles.settingContainer}>
            <Switch
              value={item.isActive}
              disabled={isCompleted}
              onValueChange={() => togglePillActive(item.id)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 배너 추가 - 배너 수정이 필요할 수 있습니다 (배너도 RegisteredPill 변경된 구조에 맞춰야 함) */}
      {/* <TopTimeBanner nextPill={nextPill} onComplete={handleCompletePill} /> */}
      {/* 우선 컴파일 오류 방지를 위해 배너 주석 처리하거나, TopTimeBanner를 업데이트해야 함. */}
      {/* nextPill이 null일 수 있으므로 조건부 렌더링을 고려해야 하지만, TopTimeBanner 내부에서 처리함. */}
      {/* TopTimeBanner가 아직 RegisteredPill의 time: Date를 쓰고 있다면 오류가 날 것임. */}

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
