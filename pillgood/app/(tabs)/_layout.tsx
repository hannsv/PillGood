import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CAF50", // 활성화 시 초록색
        tabBarInactiveTintColor: "#A0A0A0", // 비활성화 시 진한 회색 (더 잘 보이게)
        tabBarShowLabel: true, // 일단 글자가 보이는지 확인하기 위해 true로 변경
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 30 : 20, // iOS는 하단 바 때문에 조금 더 높게
          left: 20,
          right: 20,
          backgroundColor: "#ffffff",
          borderRadius: 35, // 알약처럼 완전히 둥글게 (높이의 절반 정도)
          height: 70,
          borderTopWidth: 0,

          // 그림자 설정 (안드로이드 & iOS)
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,

          // 탭 바 내부 아이콘 정렬
          paddingBottom: Platform.OS === "ios" ? 0 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "medical" : "medical-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "List",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
