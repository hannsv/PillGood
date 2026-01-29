import { Modal, Portal, IconButton, Text, useTheme } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import { PillResult } from "./PillResultList";
import { TimeSlot } from "../common/TimeSlotSelector";
import { DayOfWeek } from "../common/DaySelector";
import { getFrequentPills } from "../../api/database";

// Import Step Components
import GroupNameStep from "./steps/pill/GroupNameStep";
import SearchPillStep from "./steps/pill/SearchPillStep";
import PillResultsStep from "./steps/pill/PillResultsStep";
import ConfirmPillStep from "./steps/pill/ConfirmPillStep";
import ActionChoiceStep from "./steps/action/ActionChoiceStep";
import DayFrequencyStep from "./steps/schedule/DayFrequencyStep";
import DayDetailStep from "./steps/schedule/DayDetailStep";
import TimeSettingStep from "./steps/schedule/TimeSettingStep";

// 단계 (groupName 추가됨)
type Step =
  | "groupName"
  | "search"
  | "results"
  | "confirm"
  | "choice"
  | "days"
  | "days_detail"
  | "time";

// RegisteredPill extends PillResult which is now imported
export interface RegisteredPill extends PillResult {
  slots: TimeSlot[]; // 변경: 단일 시간 -> 슬롯 배열
  days: DayOfWeek[]; // 요일 배열 (빈 배열 = 매일)
  isActive: boolean;
  pillNames?: string[]; // 그룹에 포함된 약 이름 목록
  group?: string; // 그룹명 추가
}

function AddPillModal({
  visible,
  onDismiss,
  onAddPill,
}: {
  visible: boolean;
  onDismiss: () => void;
  onAddPill: (pills: RegisteredPill[]) => void;
}) {
  const theme = useTheme();
  // 초기 단계를 'groupName'으로 설정
  const [step, setStep] = useState<Step>("groupName");
  const [groupName, setGroupName] = useState(""); // 그룹명 상태
  const [pillName, setPillName] = useState("");
  const [searchResults, setSearchResults] = useState<PillResult[]>([]);

  // Single selection -> Multi selection
  const [selectedPills, setSelectedPills] = useState<PillResult[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [frequentPills, setFrequentPills] = useState<PillResult[]>([]);

  // 확인 단계를 위한 임시 보관
  const [tempPill, setTempPill] = useState<PillResult | null>(null);

  useEffect(() => {
    if (visible && step === "search") {
      getFrequentPills().then(setFrequentPills);
    }
  }, [visible, step]);

  // 모달이 닫힐 때 상태 초기화
  const handleDismiss = () => {
    onDismiss();
    setStep("groupName"); // 다시 열 때 그룹명 입력부터 시작
    setGroupName(""); // 그룹명 초기화
    setPillName("");
    setSearchResults([]);
    setSelectedPills([]);
    setSelectedSlots([]);
    setSelectedDays([]);
  };

  const handleComplete = () => {
    if (selectedPills.length > 0 && selectedSlots.length > 0) {
      const newPills: RegisteredPill[] = selectedPills.map((originalPill) => ({
        ...originalPill,
        slots: selectedSlots,
        days: selectedDays,
        isActive: true,
        group: groupName, // 등록 시 그룹명 포함
      }));
      onAddPill(newPills);
      handleDismiss();
    }
  };

  // 그룹명 다음 단계로 이동
  const handleGroupSubmit = () => {
    if (groupName.trim()) {
      setStep("search");
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

  /**
   * [NEW] 결과 목록에서 약 선택 시 -> 확인(Confirm) 단계로 이동
   */
  const handleSelectFromResults = (pill: PillResult) => {
    setTempPill(pill);
    setStep("confirm");
  };

  /**
   * [NEW] 확인 단계에서 '추가' 버튼 클릭 시
   */
  const handleConfirmAdd = () => {
    if (tempPill) {
      setSelectedPills((prev) => {
        if (prev.some((p) => p.id === tempPill.id)) return prev;
        return [...prev, tempPill];
      });
      setStep("choice");
    }
  };

  /**
   * [NEW] 선택 분기에서 '더 추가하기' 클릭 시
   */
  const handleAddMore = () => {
    setPillName(""); // 검색어 초기화
    setSearchResults([]); // 결과 초기화
    setTempPill(null);
    setStep("search");
  };

  const handleProceedToSetting = () => {
    if (selectedPills.length > 0) {
      setStep("days"); // 요일 설정으로 이동
    }
  };

  const handleBack = () => {
    if (step === "search") setStep("groupName");
    else if (step === "results") setStep("search");
    else if (step === "confirm")
      setStep("results"); // 확인 -> 결과목록 취소
    else if (step === "choice") {
      setStep("search");
    } else if (step === "days") {
      setStep("choice"); // 요일 -> 선택 분기
    } else if (step === "days_detail") {
      setStep("days"); // 요일 상세 -> 요일 분기
      setSelectedDays([]); // 초기화
    } else if (step === "time") {
      // 매일(빈배열)이면 days로, 요일 선택됨(배열있음)이면 detail로 복귀
      if (selectedDays.length > 0) setStep("days_detail");
      else setStep("days");
    } else {
      handleDismiss();
    }
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
          {step !== "groupName" && step !== "choice" ? ( // choice에서는 뒤로가기 애매하므로 숨기거나 Home으로
            <IconButton icon="arrow-left" onPress={handleBack} />
          ) : (
            <IconButton icon="arrow-left" style={{ opacity: 0 }} />
          )}
          <Text variant="titleMedium" style={{ flex: 1, textAlign: "center" }}>
            약 등록
          </Text>
          <IconButton icon="close" onPress={handleDismiss} />
        </View>

        {/* 컨텐츠 영역 */}
        <View style={styles.body}>
          {/* Step 0: 그룹 이름 입력 (NEW) */}
          {step === "groupName" && (
            <GroupNameStep
              groupName={groupName}
              setGroupName={setGroupName}
              onNext={handleGroupSubmit}
              styles={styles}
            />
          )}
          {/* Step 1: 검색 (심플 버전) */}
          {step === "search" && (
            <SearchPillStep
              groupName={groupName}
              pillName={pillName}
              setPillName={setPillName}
              onSearch={handleSearch}
              styles={styles}
            />
          )}
          {/* Step 2: 검색 결과 */}
          {step === "results" && (
            <PillResultsStep
              searchResults={searchResults}
              onSelect={handleSelectFromResults}
            />
          )}
          {/* Step 3: 확인 (Confirm) */}
          {step === "confirm" && tempPill && (
            <ConfirmPillStep
              tempPill={tempPill}
              onConfirm={handleConfirmAdd}
              onCancel={() => setStep("results")}
              styles={styles}
            />
          )}
          {/* Step 4: 선택 분기 (Action Choice) */}
          {step === "choice" && (
            <ActionChoiceStep
              selectedPills={selectedPills}
              onAddMore={handleAddMore}
              onProceed={handleProceedToSetting}
              styles={styles}
            />
          )}
          {/* Step 5: 요일 알림 설정 (days) - 분기 화면 */}
          {step === "days" && (
            <DayFrequencyStep
              onSelectEveryday={() => {
                setSelectedDays([]); // 빈 배열 = 매일
                setStep("time");
              }}
              onSelectSpecificDays={() => setStep("days_detail")}
              styles={styles}
            />
          )}

          {/* Step 5-1: 요일 상세 선택 (days_detail) */}
          {step === "days_detail" && (
            <DayDetailStep
              selectedDays={selectedDays}
              onChange={setSelectedDays}
              onNext={() => setStep("time")}
              styles={styles}
            />
          )}
          {/* Step 6: 시간 알림 설정 (time) */}
          {step === "time" && (
            <TimeSettingStep
              selectedSlots={selectedSlots}
              onChange={setSelectedSlots}
              onComplete={handleComplete}
              styles={styles}
            />
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: "90%",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

export default AddPillModal;
