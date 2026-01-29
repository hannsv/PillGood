import React, { useRef } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Text, Button, useTheme, Icon } from "react-native-paper";

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
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    inputRef.current?.clear();
    setPillName("");
  };

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

      {/* React Native Paper Searchbar 대신 Native TextInput 사용 (한글 깨짐 방지) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.elevation?.level2 || "#f5f5f5",
          borderRadius: 28, // 둥근 모서리 (Searchbar 스타일)
          height: 56,
          width: "90%",
          paddingHorizontal: 16,
          marginBottom: 20,
        }}
      >
        <Icon
          source="magnify"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
        <TextInput
          ref={inputRef}
          defaultValue={pillName} // value 대신 defaultValue 사용
          onChangeText={setPillName}
          placeholder="약 이름을 입력하세요"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: theme.colors.onSurface,
            // 안드로이드 패딩 제거
            paddingVertical: 0,
          }}
          onSubmitEditing={onSearch} // Enter 키 입력 시 검색 실행
          autoFocus
          returnKeyType="search"
          autoCorrect={false}
          spellCheck={false}
        />
        {pillName.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Icon
              source="close"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

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
