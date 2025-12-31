import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";
import PillScreen from "../../screens/PillScreen";

function BottomNavBar() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "pill",
      title: "약",
      focusedIcon: "pill",
    },
    { key: "albums", title: "최근기록", focusedIcon: "album" },
    { key: "recents", title: "검색", focusedIcon: "history" },
    {
      key: "notifications",
      title: "설정",
      focusedIcon: "bell",
      unfocusedIcon: "bell-outline",
    },
  ]);

  const PillRoute = () => <PillScreen />;
  const AlbumsRoute = () => <Text>Albums</Text>;
  const RecentsRoute = () => <Text>Recents</Text>;
  const NotificationsRoute = () => <Text>Notifications</Text>;

  const renderScene = BottomNavigation.SceneMap({
    pill: PillRoute,
    albums: AlbumsRoute,
    recents: RecentsRoute,
    notifications: NotificationsRoute,
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
