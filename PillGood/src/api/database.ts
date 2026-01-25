import * as SQLite from "expo-sqlite";
import { RegisteredPill } from "../components/modal/AddPillModal";
import { TimeSlot } from "../components/modal/TimeSlotSelector";

// 데이터베이스 열기 (파일 이름: pillgood.db)
export const dbPromise = SQLite.openDatabaseAsync("pillgood.db");

// 간단한 UUID 생성기 (패키지 의존성 제거)
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 약 추가 (Transaction)
 * PillGroup -> Pill -> Schedules 순서로 저장
 */
export const addPillToDB = async (pill: RegisteredPill) => {
  const db = await dbPromise;

  // 1. 그룹 ID 생성
  const groupId = generateUUID();
  const now = new Date().toISOString();

  try {
    // 2. PillGroup 추가 (단일 약이지만 그룹으로 관리)
    await db.runAsync(
      "INSERT INTO PillGroups (id, user_id, title, description, created_at) VALUES (?, ?, ?, ?, ?)",
      [groupId, "user-default", pill.name, pill.company || "", now],
    );

    // 3. Pill 추가
    // RegisteredPill의 id는 검색 결과의 ID이므로, 로컬 DB용 유니크 ID는 새로 생성하거나 그대로 사용 (여기서는 중복 방지를 위해 pill.id + 랜덤 사용 추천하지만, 편의상 그대로 사용하되 충돌 주의)
    // 실제로는 물리적 약 인스턴스이므로 새로 생성하는 게 맞음.
    const pillInstanceId = generateUUID();
    await db.runAsync(
      "INSERT INTO Pills (id, group_id, name, company, memo) VALUES (?, ?, ?, ?, ?)",
      [pillInstanceId, groupId, pill.name, pill.company || "", ""],
    );

    // 4. Schedules 추가 (선택된 슬롯만큼)
    for (const slot of pill.slots) {
      const scheduleId = generateUUID();
      // UI에서 선택한 days 저장 (빈 배열이면 매일 복용을 의미하도록 로직 처리 필요)
      await db.runAsync(
        "INSERT INTO Schedules (id, group_id, slot, time, days, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        [
          scheduleId,
          groupId,
          slot,
          null,
          JSON.stringify(pill.days || []),
          pill.isActive ? 1 : 0,
        ],
      );
    }

    console.log("Pill added to DB:", pill.name);
  } catch (error) {
    console.error("Error adding pill to DB:", error);
    throw error;
  }
};

/**
 * 모든 약 목록 가져오기
 * JOIN을 통해 나중에 구현할 수도 있지만, 지금은 각 테이블에서 가져와서 조립
 */
export const getPillsFromDB = async (): Promise<RegisteredPill[]> => {
  const db = await dbPromise;

  try {
    // 모든 활성 그룹 가져오기
    const groups = await db.getAllAsync<{
      id: string;
      title: string;
      description: string;
    }>("SELECT * FROM PillGroups");

    const results: RegisteredPill[] = [];

    for (const group of groups) {
      // 해당 그룹의 스케줄(슬롯) 가져오기
      const schedules = await db.getAllAsync<{
        slot: string;
        is_active: number;
        days: string;
      }>("SELECT slot, is_active, days FROM Schedules WHERE group_id = ?", [
        group.id,
      ]);

      // 스케줄이 없으면 스킵 (혹은 빈 슬롯으로 표시)
      if (schedules.length === 0) continue;

      // 슬롯 배열 변환
      const slots = schedules.map((s) => s.slot as TimeSlot);
      // 활성 상태는 하나라도 꺼져있으면 꺼진걸로? -> 첫번째 스케줄 기준
      const isActive =
        schedules.length > 0 ? Boolean(schedules[0].is_active) : true;

      // 요일 정보 파싱 (첫 번째 스케줄 기준)
      let days = [];
      if (schedules.length > 0 && schedules[0].days) {
        try {
          days = JSON.parse(schedules[0].days);
        } catch (e) {
          console.warn("Failed to parse days JSON", e);
        }
      }

      results.push({
        id: group.id, // 리스트 키로 그룹 ID 사용
        name: group.title,
        company: group.description, // description 필드에 제조사 저장했음
        slots: slots,
        days: days,
        isActive: isActive,
        isCustom: false, // DB에서 불러온건지 확인용
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching pills:", error);
    return [];
  }
};

/**
 * 약 삭제 (그룹 삭제 시 Cascade로 하위 데이터 모두 삭제됨)
 */
export const deletePillFromDB = async (groupId: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync("DELETE FROM PillGroups WHERE id = ?", [groupId]);
    console.log("Deleted pill group:", groupId);
  } catch (error) {
    console.error("Error deleting pill:", error);
    throw error;
  }
};

/**
 * 약 활성/비활성 토글
 */
export const togglePillActiveDB = async (
  groupId: string,
  isActive: boolean,
) => {
  const db = await dbPromise;
  try {
    const activeVal = isActive ? 1 : 0;
    await db.runAsync("UPDATE Schedules SET is_active = ? WHERE group_id = ?", [
      activeVal,
      groupId,
    ]);
  } catch (error) {
    console.error("Error toggling pill:", error);
  }
};

/**
 * 데이터베이스 초기화: 테이블 생성
 */
export const initDatabase = async () => {
  const db = await dbPromise;

  try {
    // Foreign key 활성화
    await db.execAsync("PRAGMA foreign_keys = ON;");

    // 1. 사용자 테이블
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        age INTEGER
      );
    `);

    // 2. 약 그룹 테이블
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS PillGroups (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      );
    `);

    // 3. 약 정보 테이블
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Pills (
        id TEXT PRIMARY KEY NOT NULL,
        group_id TEXT,
        name TEXT NOT NULL,
        company TEXT,
        memo TEXT,
        FOREIGN KEY (group_id) REFERENCES PillGroups(id) ON DELETE CASCADE
      );
    `);

    // 4. 약 검색/저장용 정보 테이블 (상세 정보 저장용)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS SavedDrugInfo (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        efficacy TEXT,
        usage TEXT,
        precautions TEXT,
        saved_at TEXT NOT NULL
      );
    `);

    // 5. 복용 일정 테이블 (Slot 기반)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Schedules (
        id TEXT PRIMARY KEY NOT NULL,
        group_id TEXT NOT NULL,
        slot TEXT NOT NULL, -- morning, lunch, dinner, bedtime
        time TEXT,
        days TEXT NOT NULL, -- JSON string array: ["Mon", "Tue"]
        is_active INTEGER DEFAULT 1, -- 1: true, 0: false
        FOREIGN KEY (group_id) REFERENCES PillGroups(id) ON DELETE CASCADE
      );
    `);

    // 6. 복용 이력 테이블
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS History (
        id TEXT PRIMARY KEY NOT NULL,
        schedule_id TEXT NOT NULL,
        taken_at TEXT NOT NULL, -- ISO String
        is_skipped INTEGER DEFAULT 0,
        FOREIGN KEY (schedule_id) REFERENCES Schedules(id) ON DELETE CASCADE
      );
    `);

    // 7. 기본 사용자 추가 (없으면 생성)
    // 외래 키 제약 조건을 만족하기 위해 필수
    const userCheck = await db.getFirstAsync(
      "SELECT * FROM Users WHERE id = ?",
      ["user-default"],
    );
    if (!userCheck) {
      await db.runAsync("INSERT INTO Users (id, name, age) VALUES (?, ?, ?)", [
        "user-default",
        "기본 사용자",
        0,
      ]);
      console.log("Default user created");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
