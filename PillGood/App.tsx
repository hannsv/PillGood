import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import BottomNavBar from "./src/components/layout/BottomNavBar";
import { API_KEY } from "@env";

import { PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "./theme";
import { initDatabase } from "./src/api/database";
import { initLocalNotifications } from "./src/utils/notification";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";

export default function App() {
  const [isDBReady, setIsDBReady] = useState(false);
  console.log("API Key:", API_KEY);

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      // 알림 권한 요청 및 채널 설정 (DB 초기화 후, UI 렌더링 전 수행)
      const hasPermission = await initLocalNotifications();
      if (hasPermission) {
        console.log("✅ 알림 권한이 허용되어 있습니다.");
      } else {
        console.log("❌ 알림 권한이 없거나 거부되었습니다.");
      }
      setIsDBReady(true);
    };
    init();
  }, []);

  if (!isDBReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={theme}
        settings={{
          icon: (props) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
          <StatusBar style="auto" />
          <BottomNavBar />
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
