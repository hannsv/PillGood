import { StyleSheet, View, FlatList } from "react-native";
import { List, Text, Divider, useTheme } from "react-native-paper";

export interface PillResult {
  id: string;
  name: string;
  company?: string;
  isCustom?: boolean;
}

export interface PillResultListProps {
  data?: PillResult[];
  onSelect?: (item: PillResult) => void;
}

export default function PillResultList({
  data = [],
  onSelect,
}: PillResultListProps) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>검색 결과가 없습니다.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: PillResult }) => {
    // 직접 입력한 항목
    if (item.isCustom) {
      return (
        <List.Item
          title={`"${item.name}"(으)로 직접 등록`}
          description="검색 결과에 없는 경우 선택하세요"
          left={(props) => (
            <List.Icon
              {...props}
              icon="pencil-plus-outline"
              color={theme.colors.primary}
            />
          )}
          style={styles.customItem}
          onPress={() => onSelect?.(item)}
        />
      );
    }

    // 일반 검색 결과
    return (
      <List.Item
        title={item.name}
        description={item.company || "제조사 정보 없음"}
        left={(props) => <List.Icon {...props} icon="pill" />}
        onPress={() => onSelect?.(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  list: {
    width: "100%",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  customItem: {
    backgroundColor: "#F0F0F0",
  },
});
