import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  Keyboard,
} from "react-native";
import {
  Searchbar,
  Text,
  Card,
  IconButton,
  Portal,
  Button,
  useTheme,
} from "react-native-paper";
import {
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  SearchHistoryItem,
} from "../api/database";

// 더미 데이터 (상세 정보 포함)
const DUMMY_DB = [
  {
    id: "1",
    name: "타이레놀정 500mg",
    company: "한국얀센",
    efficacy: "해열 및 진통, 두통, 신경통, 근육통 완화",
    usage: "성인 1회 1~2정, 1일 3~4회 (4~6시간 간격)",
    precautions: "매일 세 잔 이상 술을 마시는 사람은 의사와 상의하십시오.",
  },
  {
    id: "2",
    name: "타이레놀 이알",
    company: "한국얀센",
    efficacy: "해열 및 감기에 의한 통증 완화",
    usage: "8시간마다 2정씩 복용",
    precautions: "하루 6정을 초과하지 마십시오.",
  },
  {
    id: "3",
    name: "게보린",
    company: "삼진제약",
    efficacy: "두통, 치통, 생리통 완화",
    usage: "성인 1회 1정, 1일 3회",
    precautions: "15세 미만의 소아는 복용하지 마십시오.",
  },
  {
    id: "4",
    name: "아스피린",
    company: "바이엘",
    efficacy: "혈전 예방 및 해열 진통",
    usage: "1일 1회 1정",
    precautions: "위장 출혈 위험이 있으니 식후 복용하십시오.",
  },
  {
    id: "5",
    name: "이지엔6",
    company: "대웅제약",
    efficacy: "생리통 및 각종 통증 완화",
    usage: "통증 시 1~2캡슐 복용",
    precautions: "공복 복용을 피하십시오.",
  },
];

export default function SearchPillScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [searchResults, setSearchResults] = useState<typeof DUMMY_DB>([]);
  const [selectedPill, setSelectedPill] = useState<(typeof DUMMY_DB)[0] | null>(
    null,
  );
  const [detailVisible, setDetailVisible] = useState(false);

  // 초기 히스토리 로드
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getSearchHistory();
    setHistory(data);
  };

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
    } else {
      // 실시간 검색 (로컬 더미)
      const filtered = DUMMY_DB.filter((p) => p.name.includes(query));
      setSearchResults(filtered);
    }
  };

  const handleSelectPill = async (pill: (typeof DUMMY_DB)[0]) => {
    // 1. 상세 정보 표시
    setSelectedPill(pill);
    setDetailVisible(true);
    Keyboard.dismiss();

    // 2. 히스토리 저장
    await addSearchHistory({
      name: pill.name,
      company: pill.company,
      efficacy: pill.efficacy,
      usage: pill.usage,
      precautions: pill.precautions,
    });

    // 3. 히스토리 갱신
    loadHistory();
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const renderResultItem = ({ item }: { item: (typeof DUMMY_DB)[0] }) => (
    <Card
      style={styles.card}
      onPress={() => handleSelectPill(item)}
      mode="outlined"
    >
      <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton icon="pill" size={24} iconColor={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={{ color: "gray" }}>
            {item.company}
          </Text>
        </View>
        <IconButton icon="chevron-right" size={20} iconColor="gray" />
      </Card.Content>
    </Card>
  );

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => {
        // 히스토리 아이템 클릭 시 상세 정보 보기
        handleSelectPill({
          id: item.id.toString(), // DB id conversion
          name: item.name,
          company: item.company || "",
          efficacy: item.efficacy || "",
          usage: item.usage || "",
          precautions: item.precautions || "",
        });
      }}
    >
      <IconButton
        icon="history"
        size={20}
        iconColor="gray"
        style={{ margin: 0, marginRight: 8 }}
      />
      <Text variant="bodyLarge" style={{ flex: 1, color: "#333" }}>
        {item.name}
      </Text>
      <Text variant="labelSmall" style={{ color: "gray" }}>
        {new Date(item.searchedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          약 정보
        </Text>
        <Text variant="bodyMedium" style={{ color: "gray", marginBottom: 15 }}>
          궁금한 약의 효능과 복용법을 알아보세요.
        </Text>
        <Searchbar
          placeholder="약 이름 검색 (예: 타이레놀)"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ minHeight: 0 }} // iOS input heugh fix
        />
      </View>

      <View style={styles.content}>
        {searchQuery.trim() === "" ? (
          // 검색어 없을 때: 히스토리 표시
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", color: theme.colors.primary }}
              >
                최근 본 약
              </Text>
              {history.length > 0 && (
                <Button mode="text" onPress={handleClearHistory} compact>
                  지우기
                </Button>
              )}
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <IconButton
                  icon="book-search-outline"
                  size={60}
                  iconColor="#e0e0e0"
                />
                <Text style={{ color: "gray", marginTop: 10 }}>
                  검색 기록이 없습니다
                </Text>
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHistoryItem}
              />
            )}
          </View>
        ) : (
          // 검색 결과 표시
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderResultItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ color: "gray" }}>검색 결과가 없습니다.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* 상세 정보 모달 */}
      <Portal>
        <Modal
          visible={detailVisible}
          onDismiss={() => setDetailVisible(false)}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: "#e0e0e0",
                    borderRadius: 2,
                  }}
                />
              </View>

              {selectedPill && (
                <ScrollView>
                  <View style={styles.detailHeader}>
                    <IconButton
                      icon="pill"
                      size={40}
                      iconColor={theme.colors.primary}
                      style={{ margin: 0 }}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        variant="headlineSmall"
                        style={{ fontWeight: "bold" }}
                      >
                        {selectedPill.name}
                      </Text>
                      <Text variant="bodyMedium" style={{ color: "gray" }}>
                        {selectedPill.company}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      효능 · 효과
                    </Text>
                    <Text variant="bodyLarge" style={styles.sectionText}>
                      {selectedPill.efficacy || "정보 없음"}
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      용법 · 용량
                    </Text>
                    <Text variant="bodyLarge" style={styles.sectionText}>
                      {selectedPill.usage || "정보 없음"}
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      주의사항
                    </Text>
                    <Text
                      variant="bodyLarge"
                      style={[
                        styles.sectionText,
                        { color: theme.colors.error },
                      ]}
                    >
                      {selectedPill.precautions || "정보 없음"}
                    </Text>
                  </View>
                </ScrollView>
              )}

              <Button
                mode="contained"
                onPress={() => setDetailVisible(false)}
                style={{ marginTop: 20 }}
                buttonColor={theme.colors.primary}
              >
                닫기
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  card: {
    marginBottom: 10,
    backgroundColor: "white",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    minHeight: "60%",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#003366", // Dark Blue
  },
  sectionText: {
    lineHeight: 24,
    color: "#333",
  },
});
