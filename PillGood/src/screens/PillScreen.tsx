function PillListScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button onPress={() => setVisible(true)}>Add Pill</Button>
      <AddPillModal visible={visible} onDismiss={() => setVisible(false)} />
    </div>
  );
}

export default PillListScreen;
import React, { useState } from "react";
import AddPillModal from "../components/modal/AddPillModal";
import { Button, Portal } from "react-native-paper";
