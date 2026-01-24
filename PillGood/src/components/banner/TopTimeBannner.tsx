import { View, StyleSheet } from "react-native";
import { Text, Button, Card, Avatar, useTheme } from "react-native-paper";
import { RegisteredPill } from "../modal/AddPillModal";
import { TimeSlot } from "../modal/TimeSlotSelector";

interface TopTimeBannerProps {
  nextPill?: RegisteredPill | null;
  targetSlot?: TimeSlot | null;
  onComplete: (pillId: string) => void;
}

export default function TopTimeBanner({
  nextPill,
  targetSlot,
  onComplete,
}: TopTimeBannerProps) {
  const theme = useTheme();

  if (!nextPill || !targetSlot) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.emptyContent}>
          <Avatar.Icon
            size={40}
            icon="check-all"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          />
          <Text variant="bodyLarge" style={{ marginLeft: 15 }}>
            오늘 예정된 약 복용을 모두 완료했거나 등록된 약이 없습니다.
          </Text>
        </Card.Content>
      </Card>
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
    <Card style={styles.card}>
      <Card.Content>
        <Text
          variant="labelLarge"
          style={{ color: theme.colors.primary, marginBottom: 5 }}
        >
          다음 복용 알림 ({getSlotLabel(targetSlot)})
        </Text>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="headlineSmall" style={styles.pillName}>
              {nextPill.name}
            </Text>
            <Text variant="titleMedium" style={{ color: "gray" }}>
              {getNextPillTimeText(targetSlot)}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => onComplete(nextPill.id)}
            style={styles.button}
          >
            복용 완료
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const getNextPillTimeText = (slot: TimeSlot) => {
    switch (slot) {
      case "morning": return "아침 - 오전 8:00";
      case "lunch": return "점심 - 오후 12:00";
      case "dinner": return "저녁 - 오후 6:00";
      case "bedtime": return "자기전 - 오후 10:00";
      default: return "";
    }
}

const styles = StyleSheet.create({
  card: {
    margin: 15,
    marginBottom: 5,
    backgroundColor: "#E0F7FA", // Light cyan background to stand out
  },
  emptyContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  pillName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  button: {
    marginLeft: 10,
  },
});
