import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, List } from "react-native-paper";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ margin: 20 }}>
        설정
      </Text>
      <List.Section>
        <List.Subheader>일반</List.Subheader>
        <List.Item
          title="사용자 관리"
          left={() => <List.Icon icon="account" />}
        />
        <List.Item title="알림 설정" left={() => <List.Icon icon="bell" />} />
      </List.Section>
      <List.Section>
        <List.Subheader>데이터</List.Subheader>
        <List.Item
          title="백업 및 복원"
          left={() => <List.Icon icon="cloud-upload" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
