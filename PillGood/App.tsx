import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { API_KEY } from "@env";
import BottomNavBar from "./src/components/nav/BottomNavBar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  console.log("API Key:", API_KEY);
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* <StatusBar style="auto" /> */}
        {/* <Text>Open up App.tsx to start working on your app!</Text> */}
        <BottomNavBar />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
