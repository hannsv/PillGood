import React from "react";
import { View } from "react-native";
import { Text, Searchbar, Button, useTheme } from "react-native-paper";

interface SearchPillStepProps {
  groupName: string;
  pillName: string;
  setPillName: (name: string) => void;
  onSearch: () => void;
  styles: any;
}

export default function SearchPillStep({
  groupName,
  pillName,
  setPillName,
  onSearch,
  styles,
}: SearchPillStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContainer}>
      <View style={{ marginBottom: 30, alignItems: "center" }}>
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: "bold",
            fontSize: 28,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {groupName}
        </Text>
        <Text variant="headlineSmall" style={{ textAlign: "center" }}>
          어떤 약을 추가할까요?
        </Text>
      </View>

      <Searchbar
        value={pillName}
        onChangeText={setPillName}
        placeholder="약 이름을 입력하세요"
        style={{ width: "90%", marginBottom: 20 }}
        onSubmitEditing={onSearch} // Enter 키 입력 시 검색 실행
        autoFocus
      />
      <Button
        mode="contained"
        onPress={onSearch}
        style={{ width: "90%", paddingVertical: 6 }}
        labelStyle={{ fontSize: 18 }}
        disabled={pillName.trim() === ""}
      >
        검색
      </Button>
    </View>
  );
}
