import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";
import PillScreen from "../../screens/PillScreen";
import HistoryScreen from "../../screens/HistoryScreen";
import SettingsScreen from "../../screens/SettingsScreen";
import SearchPillScreen from "../../screens/SearchPillScreen";

function BottomNavBar() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "home",
      title: "홈",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },
    {
      key: "search",
      title: "약 검색",
      focusedIcon: "pill", // 돋보기 대신 약 모양 아이콘 사용 (약 정보 검색이므로)
      unfocusedIcon: "pill",
    },
    {
      key: "history",
      title: "기록",
      focusedIcon: "calendar-check",
      unfocusedIcon: "calendar-check-outline",
    },
    {
      key: "settings",
      title: "설정",
      focusedIcon: "cog",
      unfocusedIcon: "cog-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: PillScreen,
    search: SearchPillScreen,
    history: HistoryScreen,
    settings: SettingsScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

export default BottomNavBar;
