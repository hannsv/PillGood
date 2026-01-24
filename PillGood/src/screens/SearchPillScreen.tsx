import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Searchbar, Text, Card, Button, IconButton } from "react-native-paper";

export default function SearchPillScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query: string) => setSearchQuery(query);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          약 검색
        </Text>
        <Text variant="bodyMedium" style={{ color: "gray", marginBottom: 10 }}>
          약의 효능, 주의사항 등을 찾아보고 보관함에 저장하세요.
        </Text>
        <Searchbar
          placeholder="약 이름이나 증상을 검색하세요"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.content}>
        {/* 검색 결과 예시 (나중에 실제 데이터 연결) */}
        {!searchQuery ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="book-search-outline" size={60} iconColor="#ccc" />
            <Text style={{ color: "gray", marginTop: 10 }}>
              검색된 기록이 없습니다
            </Text>
          </View>
        ) : (
          <Text>검색 결과가 여기에 표시됩니다...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});
