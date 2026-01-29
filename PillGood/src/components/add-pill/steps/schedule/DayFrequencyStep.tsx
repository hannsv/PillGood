import React from "react";
import { View } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";

interface DayFrequencyStepProps {
  onSelectEveryday: () => void;
  onSelectSpecificDays: () => void;
  styles: any;
}

export default function DayFrequencyStep({
  onSelectEveryday,
  onSelectSpecificDays,
  styles,
}: DayFrequencyStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Text
        variant="headlineSmall"
        style={{ marginBottom: 30, textAlign: "center", fontWeight: "bold" }}
      >
        무슨 요일에 드시나요?
      </Text>

      <Button
        mode="contained"
        onPress={onSelectEveryday}
        style={{ width: "90%", paddingVertical: 8, marginBottom: 16 }}
        labelStyle={{ fontSize: 18 }}
      >
        매일
      </Button>

      <Button
        mode="outlined"
        onPress={onSelectSpecificDays}
        style={{
          width: "90%",
          paddingVertical: 8,
          borderColor: theme.colors.primary,
        }}
        labelStyle={{ fontSize: 18 }}
      >
        요일마다
      </Button>
    </View>
  );
}
