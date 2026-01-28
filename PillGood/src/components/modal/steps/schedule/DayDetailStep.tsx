import React from "react";
import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import DaySelector, { DayOfWeek } from "../../DaySelector";

interface DayDetailStepProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
  onNext: () => void;
  styles: any;
}

export default function DayDetailStep({
  selectedDays,
  onChange,
  onNext,
  styles,
}: DayDetailStepProps) {
  return (
    <View style={styles.centerContainer}>
      <Text
        variant="headlineSmall"
        style={{ marginBottom: 10, textAlign: "center" }}
      >
        무슨 요일에 드시나요?
      </Text>

      <View style={{ width: "100%", alignItems: "center" }}>
        <DaySelector selectedDays={selectedDays} onChange={onChange} />
      </View>

      <Button
        mode="contained"
        onPress={onNext}
        style={{ marginTop: 40, width: "90%", paddingVertical: 6 }}
        labelStyle={{ fontSize: 18 }}
        disabled={selectedDays.length === 0}
      >
        요일 선택 완료
      </Button>
    </View>
  );
}
