import { MD3LightTheme as DefaultTheme } from "react-native-paper";

// PillGood 전용 3색 테마 (Medical Blue & Accessibility)
// 1. Primary: 차분한 블루 (#4A90E2) - 기본 UI, 헤더
// 2. Tertiary: 선명한 오렌지 (#F5A623) - 강조/액션 (추가 버튼)
// 3. Secondary: 편안한 그린 (#66BB6A) - 완료/성공

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // 1. 메인 컬러 (Blue)
    primary: "#4A90E2",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D6E8FA",
    onPrimaryContainer: "#003366",

    // 2. 강조 컬러 (Orange) - 액션 버튼용 (Add Pill, etc)
    tertiary: "#F5A623",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FFE0B2",
    onTertiaryContainer: "#E65100",

    // 3. 완료/성공 컬러 (Green) - Secondary 슬롯 활용
    secondary: "#66BB6A",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#C8E6C9",
    onSecondaryContainer: "#1B5E20",

    // 배경색
    background: "#F9FAFB", // 눈이 편한 미색
    surface: "#FFFFFF",
    surfaceVariant: "#EEEEEE",

    error: "#FF5252", // 삭제 등 필수 경고색
  },
};
