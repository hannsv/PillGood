import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import NavBar from "./src/components/nav/NavBar";

export default function App() {
  return (
    <View style={styles.container}>
      {/* 콘텐츠가 표시될 영역 */}
      <View style={styles.content}>
        <StatusBar style="auto" />
        <Text>Welcome to PillGood!</Text>
      </View>
      {/* 하단 네비게이션 바 */}
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
