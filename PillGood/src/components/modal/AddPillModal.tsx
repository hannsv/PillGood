import {
  Button,
  Modal,
  Portal,
  Searchbar,
  Text,
  IconButton,
} from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useState } from "react";
import PillResultList, { PillResultListProps } from "./PillResultList";
import TimeSlotSelector, { TimeSlot } from "./TimeSlotSelector";

// 단계
type Step = "search" | "results" | "detail" | "setting";

// 약 정보 타입 정의
export interface PillResult {
  id: string;
  name: string;
  company?: string;
  isCustom?: boolean; // 직접 입력한 값인지 여부
}

export interface RegisteredPill extends PillResult {
  slots: TimeSlot[]; // 변경: 단일 시간 -> 슬롯 배열
  isActive: boolean;
}

function AddPillModal({
  visible,
  onDismiss,
  onAddPill,
}: {
  visible: boolean;
  onDismiss: () => void;
  onAddPill: (pill: RegisteredPill) => void;
}) {
  const [step, setStep] = useState<Step>("search");
  const [pillName, setPillName] = useState("");
  const [searchResults, setSearchResults] = useState<PillResult[]>([]);
  const [selectedPill, setSelectedPill] = useState<PillResult | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  // 모달이 닫힐 때 상태 초기화
  const handleDismiss = () => {
    onDismiss();
    setStep("search");
    setPillName("");
    setSearchResults([]);
    setSelectedPill(null);
    setSelectedSlots([]);
  };

  const handleComplete = () => {
    if (selectedPill && selectedSlots.length > 0) {
      onAddPill({
        ...selectedPill,
        slots: selectedSlots,
        isActive: true,
      });
      handleDismiss();
    }
  };

  const handleSearch = () => {
    if (!pillName.trim()) return;

    // 1. 사용자가 입력한 값을 최상단 '직접 입력' 항목으로 생성
    const customResult: PillResult = {
      id: `custom-${Date.now()}`,
      name: pillName,
      isCustom: true,
    };

    // 2. 더미 검색 결과 (나중에 실제 API 연동 시 교체)
    // 예: '타이'라고 치면 타이레놀이 나온다고 가정
    let apiResults: PillResult[] = [];

    // 시뮬레이션: 검색어가 포함된 더미 데이터가 있다고 가정
    // 실제로는 여기서 API 호출을 통해 데이터를 받아옵니다.
    const dummyDatabase: PillResult[] = [
      { id: "1", name: "타이레놀정 500mg", company: "한국얀센" },
      { id: "2", name: "타이레놀 이알", company: "한국얀센" },
      { id: "3", name: "게보린", company: "삼진제약" },
    ];

    apiResults = dummyDatabase.filter((pill) => pill.name.includes(pillName));

    // 3. 입력값(custom)을 맨 앞에 두고 합치기
    setSearchResults([customResult, ...apiResults]);
    setStep("results");
  };

  const handleSelectPill = (pill: PillResult) => {
    console.log("Selected pill:", pill);
    setSelectedPill(pill);
    setStep("setting");
  };

  const handleBack = () => {
    if (step === "results") setStep("search");
    else if (step === "detail") setStep("results");
    else if (step === "setting")
      setStep("results"); // or detail
    else handleDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContent}
      >
        {/* 모달 헤더: 뒤로가기 버튼 및 타이틀 */}
        <View style={styles.header}>
          {step !== "search" ? (
            <IconButton icon="arrow-left" onPress={handleBack} />
          ) : (
            <IconButton icon="arrow-left" style={{ opacity: 0 }} />
          )}
          <Text variant="titleMedium" style={{ flex: 1, textAlign: "center" }}>
            {step === "search" && "약 검색"}
            {step === "results" && "검색 결과"}
            {step === "setting" && "알림 설정"}
          </Text>
          <IconButton icon="close" onPress={handleDismiss} />
        </View>

        {/* 컨텐츠 영역 */}
        <View style={styles.body}>
          {/* Step 1: 검색 */}
          {step === "search" && (
            <View style={styles.centerContainer}>
              <Searchbar
                value={pillName}
                onChangeText={setPillName}
                placeholder="찾으시는 약 이름을 입력하세요"
                style={{ width: "80%", marginBottom: 20 }}
                onSubmitEditing={handleSearch} // Enter 키 입력 시 검색 실행
              />
              <Button
                mode="contained"
                onPress={handleSearch}
                style={{ width: "80%" }}
              >
                검색
              </Button>
            </View>
          )}

          {/* Step 2: 검색 결과 */}
          {step === "results" && (
            <View style={styles.centerContainer}>
              <PillResultList
                data={searchResults}
                onSelect={handleSelectPill}
              />
            </View>
          )}

          {/* Step 3: 알림 설정 */}
          {step === "setting" && (
            <View style={styles.centerContainer}>
              <Text variant="headlineSmall" style={{ marginBottom: 10 }}>
                {selectedPill?.name}
              </Text>

              <TimeSlotSelector
                selectedSlots={selectedSlots}
                onChange={setSelectedSlots}
              />

              <Button
                mode="contained"
                onPress={handleComplete}
                style={{ marginTop: 20, width: "100%" }}
                disabled={selectedSlots.length === 0}
              >
                등록 완료
              </Button>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 0.9,
    backgroundColor: "white",
    margin: 30,
    padding: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  body: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddPillModal;
