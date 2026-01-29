import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";

export type FilterDayKey =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun"
  | null;

interface DayFilterBarProps {
  selectedDay: FilterDayKey;
  onSelect: (day: FilterDayKey) => void;
}

const DAYS: { key: FilterDayKey; label: string }[] = [
  { key: null, label: "매일" },
  { key: "Mon", label: "월" },
  { key: "Tue", label: "화" },
  { key: "Wed", label: "수" },
  { key: "Thu", label: "목" },
  { key: "Fri", label: "금" },
  { key: "Sat", label: "토" },
  { key: "Sun", label: "일" },
];

export default function DayFilterBar({
  selectedDay,
  onSelect,
}: DayFilterBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="labelMedium"
        style={{
          marginLeft: 4,
          marginBottom: 8,
          color: theme.colors.outline,
        }}
      >
        요일별 목록 보기
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.key;
          return (
            <TouchableOpacity
              key={day.label}
              onPress={() => onSelect(day.key)}
              style={[
                styles.dayButton,
                isSelected
                  ? { backgroundColor: theme.colors.primary, borderWidth: 0 }
                  : {
                      backgroundColor: "transparent",
                      borderWidth: 1,
                      borderColor: theme.colors.outlineVariant,
                    },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: isSelected
                    ? theme.colors.onPrimary
                    : theme.colors.onSurfaceVariant,
                  fontSize: 13,
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingRight: 20,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
  },
});
