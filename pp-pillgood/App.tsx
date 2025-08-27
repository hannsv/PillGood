import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  BottomNavigation,
  configureFonts,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import React, { useCallback, useContext, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import TodayPillPage from "./src/pages/TodayPillPage";
import { PillContext } from "./src/context/PillContext";

import { PillListType } from "./src/type/type";

const fontConfig = {
  fontFamily: "GmarketSansTTFMedium",
};

/**
 *
 * @todo
 * 1. context API를 사용하여 pilldata를 관리한다.
 * 2. context api 테스트
 *
 */

export default function App() {
  const [pilldata, setPilldata] = useState<PillListType[]>([]); // 타입 명확히
  const [fontsLoaded] = useFonts({
    GmarketSansTTFMedium: require("./assets/fonts/GmarketSansTTFMedium.ttf"),
  });
  // useContext는 최상단에 위치해야 한다.

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded) {
    return null;
  }

  // context API

  // :: theme config Link ::
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
      <PillContext.Provider value={{ pilldata, setPilldata }}>
        <SafeAreaView onLayout={onLayoutRootView} style={styles.container}>
          <StatusBar style="auto" />
          <TodayPillPage />
        </SafeAreaView>
      </PillContext.Provider>
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
