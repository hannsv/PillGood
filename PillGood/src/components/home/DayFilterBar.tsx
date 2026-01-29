import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text, useTheme } from "react-native-paper";

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
  { key: null, label: "전체" },
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
        style={{ marginLeft: 4, marginBottom: 8, color: "gray" }}
      >
        요일별로 모아보기
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.key;
          return (
            <Chip
              key={day.label}
              mode={isSelected ? "flat" : "outlined"}
              selected={isSelected}
              onPress={() => onSelect(day.key)}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={{
                fontWeight: isSelected ? "bold" : "normal",
                fontSize: 16,
                marginVertical: 4,
                marginHorizontal: 8,
              }}
              showSelectedOverlay={true}
            >
              {day.label}
            </Chip>
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
    paddingHorizontal: 4,
  },
  chip: {
    marginRight: 8,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
  },
});
