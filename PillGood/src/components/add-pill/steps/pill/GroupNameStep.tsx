import React from "react";
import { View, TextInput } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";

interface GroupNameStepProps {
  groupName: string;
  setGroupName: (name: string) => void;
  onNext: () => void;
  styles: any;
}

export default function GroupNameStep({
  groupName,
  setGroupName,
  onNext,
  styles,
}: GroupNameStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContainer}>
      <View style={{ width: "80%", marginBottom: 20 }}>
        <Text
          variant="headlineSmall"
          style={{ marginBottom: 10, textAlign: "center" }}
        >
          어떤 종류의 약인가요?
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            color: "gray",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          예: 혈압약, 비타민, 감기약 등
        </Text>

        {/* React Native Paper의 TextInput 대신 Native TextInput 사용 (한글 자소 분리 방지) */}
        <View
          style={{
            borderColor: theme.colors.outline,
            borderWidth: 1,
            borderRadius: 4,
            backgroundColor: "white",
            paddingHorizontal: 12,
            height: 56, // Paper TextInput 기본 높이와 유사하게
            justifyContent: "center",
          }}
        >
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="그룹 이름을 입력하세요"
            style={{
              fontSize: 16,
              color: theme.colors.onSurface,
            }}
            autoFocus
            onSubmitEditing={onNext}
            returnKeyType="next"
            placeholderTextColor={theme.colors.onSurfaceDisabled}
          />
        </View>
      </View>
      <Button
        mode="contained"
        onPress={onNext}
        style={{ width: "80%" }}
        disabled={!groupName.trim()}
      >
        다음
      </Button>
    </View>
  );
}
