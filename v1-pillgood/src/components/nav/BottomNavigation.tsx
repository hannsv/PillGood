import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNavigation() {
  //   currentScreen,
  //   onNavigate,
  // }: BottomNavigationProps) {
  //   const navItems = [
  //     { id: "home", icon: Home, label: "Home" },
  //     { id: "search", icon: Search, label: "Search" },
  //     { id: "notifications", icon: Bell, label: "Notifications" },
  //     { id: "records", icon: FileText, label: "Records" },
  //   ];

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Camera size={24} color={"#6b7280"} />
        {/* <Home /> */}
        {/* {navItems.map(({ id, icon: Icon, label }) => (
          <Pressable
            key={id}
            onPress={() => onNavigate(id)}
            style={styles.navItem}
          >
            <Icon
              size={24}
              color={currentScreen === id ? "#4ade80" : "#6b7280"}
            />
            <Text
              style={[
                styles.label,
                { color: currentScreen === id ? "#4ade80" : "#6b7280" },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    // iOS 하단 여백을 위해 SafeAreaView를 사용하거나 paddingBottom을 조정하세요.
    paddingBottom: 16,
    paddingTop: 8,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
