import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  BottomNavigation,
  configureFonts,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { useCallback } from "react";

import { DefaultTheme } from "react-native-paper";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import TodayPillPage from "./src/pages/TodayPillPage";

const fontConfig = {
  fontFamily: "GmarketSansTTFMedium",
};

export default function App() {
  const [fontsLoaded] = useFonts({
    GmarketSansTTFMedium: require("./assets/fonts/GmarketSansTTFMedium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // theme config
  // https://callstack.github.io/react-native-paper/docs/guides/theming
  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: "#356562",
      surface: "#356562",
      onSurface: "#ffffff",
      onSurfaceVariant: "#ffffff",
      surfaceVariant: "#5daca5",
      tertiary: "white",
      accent: "#03dac4",
      text: "#ffffff",
    },
    fonts: configureFonts({ config: fontConfig }),
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView onLayout={onLayoutRootView} style={styles.container}>
        <StatusBar style="auto" />
        <TodayPillPage />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
