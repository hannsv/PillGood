import { View, StyleSheet } from "react-native";
import { Text, Button, Card, Avatar, useTheme } from "react-native-paper";
import { RegisteredPill } from "../modal/AddPillModal";
import { TimeSlot } from "../modal/TimeSlotSelector";

interface TopTimeBannerProps {
  nextPill?: RegisteredPill | null;
  targetSlot?: TimeSlot | null;
  hasPillsToday?: boolean;
  onComplete: (pillId: string) => void;
}

export default function TopTimeBanner({
  nextPill,
  targetSlot,
  hasPillsToday = true,
  onComplete,
}: TopTimeBannerProps) {
  const theme = useTheme();

  if (!nextPill || !targetSlot) {
    // 오늘 약이 없어서 안 뜨는 경우 (회색)
    if (!hasPillsToday) {
      return (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <View style={styles.emptyContent}>
            <Avatar.Icon
              size={48}
              icon="calendar-blank"
              style={{ backgroundColor: "transparent" }}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodyLarge"
              style={{
                marginLeft: 8,
                flex: 1,
                color: theme.colors.onSurfaceVariant,
                fontWeight: "600",
              }}
            >
              오늘 예정된 약이 없습니다.
            </Text>
          </View>
        </View>
      );
    }

    // 오늘 약을 다 먹어서 완료된 경우 (초록색 = Secondary Color)
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.secondary }, // 테마의 초록색 사용
        ]}
      >
        <View style={styles.emptyContent}>
          <Avatar.Icon
            size={48}
            icon="check-circle"
            style={{ backgroundColor: "transparent" }}
            color={theme.colors.onSecondary} // 흰색
          />
          <Text
            variant="bodyLarge"
            style={{
              marginLeft: 8,
              flex: 1,
              color: theme.colors.onSecondary, // 흰색
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            오늘의 복용을 모두 완료했어요! 🎉
          </Text>
        </View>
      </View>
    );
  }

  const getSlotLabel = (slot: TimeSlot) => {
    switch (slot) {
      case "morning":
        return "아침";
      case "lunch":
        return "점심";
      case "dinner":
        return "저녁";
      case "bedtime":
        return "자기전";
      default:
        return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
      >
        <Avatar.Icon
          size={24}
          icon="bell-ring"
          style={{ backgroundColor: "transparent", margin: 0 }}
          color={theme.colors.onPrimary}
        />
        <Text
          variant="labelLarge"
          style={{
            color: theme.colors.onPrimary,
            fontWeight: "bold",
            marginLeft: 4,
            opacity: 0.9,
          }}
        >
          다음 복용 알림 ({getSlotLabel(targetSlot)})
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.info}>
          <Text
            variant="headlineMedium"
            style={[styles.pillName, { color: theme.colors.onPrimary }]}
          >
            {nextPill.name}
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onPrimary, opacity: 0.85 }}
          >
            {getNextPillTimeText(targetSlot)}
          </Text>
        </View>
        <Button
          mode="contained"
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimaryContainer}
          onPress={() => onComplete(nextPill.id)}
          style={styles.button}
          contentStyle={{ height: 56, paddingHorizontal: 4 }}
          labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        >
          복용 완료
        </Button>
      </View>
    </View>
  );
}

const getNextPillTimeText = (slot: TimeSlot) => {
  switch (slot) {
    case "morning":
      return "아침 - 오전 8:00";
    case "lunch":
      return "점심 - 오후 12:00";
    case "dinner":
      return "저녁 - 오후 6:00";
    case "bedtime":
      return "자기전 - 오후 10:00";
    default:
      return "";
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    width: "100%",
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 16,
    zIndex: 10,
  },
  emptyContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  info: {
    flex: 1,
  },
  pillName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  button: {
    borderRadius: 12,
    marginLeft: 16,
    elevation: 2,
  },
});
