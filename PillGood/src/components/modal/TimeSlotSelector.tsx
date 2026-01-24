import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton, useTheme } from "react-native-paper";

export type TimeSlot = "morning" | "lunch" | "dinner" | "bedtime";

interface TimeSlotSelectorProps {
  selectedSlots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

const SLOT_CONFIG: {
  [key in TimeSlot]: { label: string; icon: string; time: number };
} = {
  morning: { label: "아침", icon: "weather-sunny", time: 9 }, // 09:00
  lunch: { label: "점심", icon: "silverware-fork-knife", time: 13 }, // 13:00
  dinner: { label: "저녁", icon: "weather-sunset", time: 18 }, // 18:00
  bedtime: { label: "자기전", icon: "bed", time: 22 }, // 22:00
};

export default function TimeSlotSelector({
  selectedSlots,
  onChange,
}: TimeSlotSelectorProps) {
  const theme = useTheme();

  const toggleSlot = (slot: TimeSlot) => {
    if (selectedSlots.includes(slot)) {
      onChange(selectedSlots.filter((s) => s !== slot));
    } else {
      onChange([...selectedSlots, slot]);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ marginBottom: 15 }}>
        복용 시간 선택
      </Text>
      <View style={styles.row}>
        {(Object.keys(SLOT_CONFIG) as TimeSlot[]).map((slot) => {
          const isSelected = selectedSlots.includes(slot);
          const config = SLOT_CONFIG[slot];

          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotButton,
                isSelected && {
                  backgroundColor: theme.colors.primaryContainer,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => toggleSlot(slot)}
            >
              <IconButton
                icon={config.icon}
                iconColor={
                  isSelected
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
                size={24}
                style={{ margin: 0 }}
              />
              <Text
                variant="labelMedium"
                style={{
                  color: isSelected
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {config.label}
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
    alignItems: "center",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  slotButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "23%", // 4 items in a row
    backgroundColor: "white",
  },
});
