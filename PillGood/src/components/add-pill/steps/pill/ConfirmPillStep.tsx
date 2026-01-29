import React from "react";
import { View } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { PillResult } from "../../PillResultList";

interface ConfirmPillStepProps {
  tempPill: PillResult;
  onConfirm: () => void;
  onCancel: () => void;
  styles: any;
}

export default function ConfirmPillStep({
  tempPill,
  onConfirm,
  onCancel,
  styles,
}: ConfirmPillStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Text variant="titleLarge" style={{ marginBottom: 40 }}>
        이 약을 추가하시겠습니까?
      </Text>

      <View
        style={{
          padding: 30,
          backgroundColor: theme.colors.secondaryContainer,
          borderRadius: 16,
          marginBottom: 40,
          width: "90%",
          alignItems: "center",
        }}
      >
        <Text
          variant="headlineSmall"
          style={{ fontWeight: "bold", textAlign: "center" }}
        >
          {tempPill.name}
        </Text>
        {tempPill.company && (
          <Text
            variant="bodyMedium"
            style={{
              marginTop: 8,
              color: theme.colors.onSecondaryContainer,
            }}
          >
            {tempPill.company}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 16, width: "90%" }}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={{ flex: 1, borderColor: "#ccc" }}
          textColor="gray"
        >
          아니요
        </Button>
        <Button
          mode="contained"
          onPress={onConfirm}
          style={{ flex: 1 }}
          labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        >
          네, 맞아요
        </Button>
      </View>
    </View>
  );
}
