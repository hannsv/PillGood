import React from "react";
import { View } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

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
        <TextInput
          mode="outlined"
          label="그룹 이름"
          value={groupName}
          onChangeText={setGroupName}
          placeholder="그룹 이름을 입력하세요"
          style={{ backgroundColor: "white" }}
          autoFocus
          onSubmitEditing={onNext}
        />
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
