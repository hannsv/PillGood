import {
  MD3LightTheme as DefaultTheme,
  configureFonts,
} from "react-native-paper";

// PillGood 전용 블루 테마 (Medical Blue)
// Primary: 메인 버튼, 활성 상태 색상
// Background: 앱 배경색
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // 1. 핵심 컬러 (파란 계열)
    primary: "#0062A3", // 진한 파랑 (버튼, 헤더, 아이콘 강조)
    onPrimary: "#FFFFFF", // 진한 파랑 위의 글자색 (흰색)
    primaryContainer: "#D1E4FF", // 연한 파랑 (선택된 항목 배경, 칩 배경)
    onPrimaryContainer: "#001D36", // 연한 파랑 위의 글자색

    // 2. 보조 컬러 (차분한 그레이 블루)
    secondary: "#535F70", // 보조 버튼, 덜 중요한 텍스트
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D7E3F7",
    onSecondaryContainer: "#101C2B",

    // 3. 배경 및 표면
    background: "#F8F9FA", // 앱 전체 배경 (완전 흰색보다 눈이 편한 미색)
    surface: "#FFFFFF", // 카드나 모달의 배경 (흰색)
    surfaceVariant: "#E0E2EC", // 입력창(Input) 배경색

    // 4. 에러 및 경고 (약 복용 놓쳤을 때 등)
    error: "#BA1A1A",

    // 5. 윤곽선
    outline: "#74777F", // 입력창 테두리 등
  },
};
