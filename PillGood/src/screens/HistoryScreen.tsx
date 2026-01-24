import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">복용 기록</Text>
      <Text variant="bodyMedium" style={{ marginTop: 10 }}>
        달력과 복용 내역이 표시될 화면입니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
