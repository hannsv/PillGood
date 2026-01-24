// 1. 사용자 (Users)
// 앱 사용자를 관리합니다. 추후 가족 관리 기능 등으로 확장 가능합니다.
export interface User {
  id: string; // 모바일 최적화: AUTOINCREMENT 대신 UUID(String) 사용 (오프라인 생성 및 서버 동기화 용이)
  name: string;
  age?: number;
}

// 2. 약 그룹 (PillGroups)
// 예: "감기약 처방", "매일 먹는 영양제" 등 약들을 묶어서 관리하는 단위입니다.
export interface PillGroup {
  id: string;
  user_id: string;
  title: string; // 그룹명 (예: 24년 1월 감기약)
  description?: string;
  created_at: string;
}

// 3. 약 정보 (Pills)
// 실제 약의 상세 정보입니다. 그룹에 속할 수도 있고, 단독일 수도 있습니다.
export interface Pill {
  id: string;
  group_id: string | null; // 그룹에 속하지 않을 수도 있으므로 nullable
  name: string; // 약 이름 (예: 타이레놀)
  company?: string; // 제조사
  memo?: string; // 사용자 메모
}

// 3-1. (신규) 약 검색/저장용 정보 (SavedDrugInfo)
// 사용자가 검색해서 저장해둔 약의 상세 정보입니다. (복용 스케줄과 무관)
// 효능, 주의사항 등 상세 데이터를 저장합니다.
export interface SavedDrugInfo {
  id: string;
  name: string;
  company?: string;
  efficacy?: string; // 효능효과
  usage?: string; // 용법용량
  precautions?: string; // 주의사항
  saved_at: string; // 저장한 날짜
}

// 4. 복용 일정 (Schedules) - 중요!
// 어떤 약 그룹을 언제 먹어야 하는지 정의합니다.
// 알림의 기준이 되는 테이블입니다.
export interface Schedule {
  id: string;
  group_id: string;
  // 변경: 구체적인 시간(HH:MM) 대신 슬롯(Slot) 중심 관리 권장
  // 사용자가 "아침"을 8시로 설정했으면, 이 슬롯을 가진 모든 그룹이 8시에 알림
  slot: "morning" | "lunch" | "dinner" | "bedtime";
  time?: string; // (선택) 해당 슬롯의 기본 시간이 아니라 커스텀 시간을 원할 경우 사용
  days: string[]; // 요일 ["Mon", "Tue", ...] (빈 배열이면 매일)
  is_active: boolean; // 알림 켜짐/꺼짐 상태
}

// 5. 복용 이력 (History)
// 실제 복용 행위에 대한 기록입니다. 통계의 기초 데이터가 됩니다.
export interface History {
  id: string;
  schedule_id: string; // 어떤 스케줄을 수행했는지
  taken_at: string; // 실제 복용 완료한 시간 (ISO String)
  is_skipped: boolean; // 건너뛰기 여부
}

// --- 더미 데이터 (Dummy Data) ---

export const DUMMY_USERS: User[] = [
  { id: "user-1", name: "홍길동", age: 30 },
  { id: "user-2", name: "김철수", age: 25 },
];

export const DUMMY_GROUPS: PillGroup[] = [
  {
    id: "group-1",
    user_id: "user-1",
    title: "환절기 감기약",
    description: "내과 처방 3일치",
    created_at: "2024-01-20",
  },
  {
    id: "group-2",
    user_id: "user-1", // 홍길동
    title: "영양제",
    created_at: "2024-01-01",
  },
];

export const DUMMY_PILLS: Pill[] = [
  // 감기약 그룹
  { id: "pill-1", group_id: "group-1", name: "코푸시럽", company: "유한양행" },
  { id: "pill-2", group_id: "group-1", name: "타이레놀", company: "한국얀센" },
  // 영양제 그룹
  { id: "pill-3", group_id: "group-2", name: "오메가3", company: "종근당" },
  { id: "pill-4", group_id: "group-2", name: "비타민C", company: "고려은단" },
];

export const DUMMY_SCHEDULES: Schedule[] = [
  // 감기약 그룹 (group-1): 아침, 저녁 (하루 2번)
  {
    id: "sch-1",
    group_id: "group-1",
    slot: "morning",
    days: [],
    is_active: true,
  },
  {
    id: "sch-2",
    group_id: "group-1",
    slot: "dinner",
    days: [],
    is_active: true,
  },

  // 영양제 그룹 (group-2): 점심 (하루 1번)
  {
    id: "sch-3",
    group_id: "group-2",
    slot: "lunch",
    days: [],
    is_active: true,
  },
   // 추가 예시: 영양제를 아침에도 먹는다면? (감기약과 아침 슬롯 겹침 -> OK)
   {
    id: "sch-4",
    group_id: "group-2",
    slot: "morning",
    days: [],
    is_active: true,
  },
];    group_id: "group-2",
    time: "13:00",
    days: [],
    is_active: true,
  },
];

export const DUMMY_HISTORY: History[] = [
  // 어제 기록
  {
    id: "hist-1",
    schedule_id: "sch-1", // 감기약 아침
    taken_at: "2024-01-22T09:05:00",
    is_skipped: false,
  },
  {
    id: "hist-2",
    schedule_id: "sch-3", // 영양제 점심
    taken_at: "2024-01-22T13:30:00",
    is_skipped: false,
  },
  // 감기약 저녁은 기록 없음

  // 오늘 기록 (아침약 먹음)
  {
    id: "hist-3",
    schedule_id: "sch-1", // 감기약 아침
    taken_at: "2024-01-23T08:55:00",
    is_skipped: false,
  },
];
