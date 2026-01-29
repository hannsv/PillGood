import React from "react";
import { View } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import TimeSlotSelector, { TimeSlot } from "../../../common/TimeSlotSelector";

interface TimeSettingStepProps {
  selectedSlots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  onComplete: () => void;
  styles: any;
}

export default function TimeSettingStep({
  selectedSlots,
  onChange,
  onComplete,
  styles,
}: TimeSettingStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Text
        variant="headlineSmall"
        style={{ marginBottom: 10, textAlign: "center" }}
      >
        언제 드시나요?
      </Text>

      <TimeSlotSelector selectedSlots={selectedSlots} onChange={onChange} />

      <Button
        mode="contained"
        onPress={onComplete}
        style={{ marginTop: 40, width: "100%", paddingVertical: 6 }}
        buttonColor={theme.colors.tertiary}
        textColor={theme.colors.onTertiary}
        disabled={selectedSlots.length === 0}
        labelStyle={{ fontSize: 18, fontWeight: "bold" }}
      >
        등록 완료
      </Button>
    </View>
  );
}
