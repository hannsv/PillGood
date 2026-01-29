import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import PillResultList, { PillResult } from "../../PillResultList";

interface PillResultsStepProps {
  searchResults: PillResult[];
  onSelect: (pill: PillResult) => void;
}

export default function PillResultsStep({
  searchResults,
  onSelect,
}: PillResultsStepProps) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        variant="titleMedium"
        style={{ marginBottom: 16, textAlign: "center" }}
      >
        목록에서 약을 선택해주세요
      </Text>
      <PillResultList
        data={searchResults}
        selectedIds={[]} // 중복확인은 handleSelectFromResults에서 처리하므로 여기선 표시 안함
        onSelect={onSelect}
      />
    </View>
  );
}
