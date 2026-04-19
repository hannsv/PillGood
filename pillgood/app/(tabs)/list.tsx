import { View, Text, StyleSheet, FlatList } from "react-native";

export default function ListScreen() {
  // 나중에 DB나 스토어에서 가져올 임시 데이터
  const myPills = [
    { id: "1", name: "멀티비타민", time: "오전 09:00" },
    { id: "2", name: "오메가3", time: "오후 13:00" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 약 상자</Text>
      <FlatList
        data={myPills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.pillName}>{item.name}</Text>
            <Text style={styles.pillTime}>{item.time}</Text>
          </View>
        )}
      />
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
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  pillName: { fontSize: 18, fontWeight: "600" },
  pillTime: { color: "#666" },
});
