import React from "react";
import { View } from "react-native";
import { Text, IconButton, Chip, Button, useTheme } from "react-native-paper";
import { PillResult } from "../../PillResultList";

interface ActionChoiceStepProps {
  selectedPills: PillResult[];
  onAddMore: () => void;
  onProceed: () => void;
  styles: any;
}

export default function ActionChoiceStep({
  selectedPills,
  onAddMore,
  onProceed,
  styles,
}: ActionChoiceStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContainer}>
      <View style={{ marginBottom: 40, alignItems: "center" }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primaryContainer,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <IconButton icon="check" iconColor={theme.colors.primary} size={32} />
        </View>
        <Text
          variant="headlineSmall"
          style={{ fontWeight: "bold", marginBottom: 8 }}
        >
          추가되었습니다!
        </Text>
        <Text variant="bodyLarge" style={{ color: "gray" }}>
          현재 {selectedPills.length}개의 약이 담겼어요.
        </Text>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {selectedPills.map((p) => (
            <Chip key={p.id}>{p.name}</Chip>
          ))}
        </View>
      </View>

      <Button
        mode="outlined"
        onPress={onAddMore}
        style={{ width: "90%", marginBottom: 16, paddingVertical: 4 }}
      >
        다른 약 더 추가하기
      </Button>
      <Button
        mode="contained"
        onPress={onProceed}
        style={{ width: "90%", paddingVertical: 6 }}
        labelStyle={{ fontSize: 18 }}
      >
        이대로 복용 설정하기
      </Button>
    </View>
  );
}
