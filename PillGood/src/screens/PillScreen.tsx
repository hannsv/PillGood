import React, { useState } from "react";
import { View } from "react-native";

import AddPillModal from "../components/modal/AddPillModal";
import { Button, Portal } from "react-native-paper";

function PillListScreen() {
  const [visible, setVisible] = useState(false);
  const [screenState, setScreenState] = useState<"add" | "details">("add");

  const [pillList, setPillList] = useState<Array<{ id: number; name: string }>>(
    []
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {screenState === "add" ? (
        <AddPillModal visible={visible} onDismiss={() => setVisible(false)} />
      ) : null}
      <Button mode="contained" onPress={() => setVisible(true)}>
        약 추가하기
      </Button>
      {pillList.map((pill) => (
        <View key={pill.id} style={{ marginTop: 10 }}>
          <Button mode="outlined">{pill.name}</Button>
        </View>
      ))}
    </View>
  );
}

export default PillListScreen;
