import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  // 임시 데이터 (나중에 상태 관리 라이브러리로 연결)
  const todayPills = [
    { id: "1", name: "멀티비타민", time: "09:00", taken: true },
    { id: "2", name: "오메가3", time: "13:00", taken: false },
    { id: "3", name: "유산균", time: "21:00", taken: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 상단 대시보드 (위젯 느낌) */}
      <View style={styles.dashboard}>
        <Text style={styles.greeting}>안녕하세요! 기분 좋은 하루네요. 💊</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>오늘의 복용 현황</Text>
          <Text style={styles.progressValue}>1 / 3</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: "33%" }]} />
        </View>
      </View>

      {/* 투약 리스트 세션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘 먹을 약</Text>

        {todayPills.map((pill) => (
          <TouchableOpacity
            key={pill.id}
            style={[styles.pillCard, pill.taken && styles.pillCardTaken]}
            activeOpacity={0.7}
          >
            <View style={styles.pillInfo}>
              <View style={[styles.timeTag, pill.taken && styles.timeTagTaken]}>
                <Text style={styles.timeText}>{pill.time}</Text>
              </View>
              <Text
                style={[styles.pillName, pill.taken && styles.pillNameTaken]}
              >
                {pill.name}
              </Text>
            </View>

            <Ionicons
              name={pill.taken ? "checkmark-circle" : "ellipse-outline"}
              size={32}
              color={pill.taken ? "#4CAF50" : "#DDD"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* 여백 (하단 플로팅 탭 바에 가려지지 않게) */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  dashboard: {
    backgroundColor: "#4CAF50",
    padding: 25,
    borderRadius: 25,
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  greeting: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  progressText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  progressValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#FFF",
    borderRadius: 4,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  pillCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  pillCardTaken: {
    backgroundColor: "#F1F1F1",
    elevation: 0,
  },
});
