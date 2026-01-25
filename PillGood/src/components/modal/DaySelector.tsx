import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface DaySelectorProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

const DAYS_CONFIG: { key: DayOfWeek; label: string }[] = [
  { key: "Mon", label: "월" },
  { key: "Tue", label: "화" },
  { key: "Wed", label: "수" },
  { key: "Thu", label: "목" },
  { key: "Fri", label: "금" },
  { key: "Sat", label: "토" },
  { key: "Sun", label: "일" },
];

export default function DaySelector({
  selectedDays,
  onChange,
}: DaySelectorProps) {
  const theme = useTheme();

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const isEveryday = selectedDays.length === 0 || selectedDays.length === 7;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium">요일 반복</Text>
        <Text variant="bodySmall" style={{ color: "gray" }}>
          {selectedDays.length === 0
            ? "매일"
            : `${selectedDays.length}일 선택됨`}
        </Text>
      </View>
      <View style={styles.row}>
        {DAYS_CONFIG.map((day) => {
          const isSelected = selectedDays.includes(day.key);
          return (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayButton,
                isSelected && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
                !isSelected &&
                  selectedDays.length === 0 && {
                    // 매일(선택 안함)일 때의 시각적 처리? (선택: 없음. 그냥 기본)
                    borderColor: "#e0e0e0",
                  },
              ]}
              onPress={() => toggleDay(day.key)}
            >
              <Text
                style={{
                  color: isSelected ? "white" : theme.colors.onSurface,
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
});
