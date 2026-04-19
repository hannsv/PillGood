import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>설정</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 설정</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>푸시 알림 켜기/끄기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>위젯 설정</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>위젯 테마 변경 (Dark/Light)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text>위젯 투명도 조절</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, color: "#888", marginBottom: 10 },
  menuItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
});
