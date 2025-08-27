import { View, StyleSheet } from "react-native";
import { Button, Modal, Portal, useTheme, Text } from "react-native-paper";
import PillModal from "../components/PillModal";
import { ContextType, createContext, useContext, useState } from "react";
import DefaultButton from "../components/DefaultButton";
import { PillContextType } from "../type/type";
import { PillContext } from "../context/PillContext";

export default function TodayPillPage() {
  const [modalVisible, setModalVisible] = useState<boolean>(true);

  const { colors } = useTheme();

  // 모달 열기
  const openModal = () => setModalVisible(true);
  // 모달 닫기
  const closeModal = () => setModalVisible(false);

  const { pilldata, setPilldata } = useContext(PillContext);

  return (
    <View>
      <Button
        style={[styles.createBtn, { backgroundColor: colors.primary }]}
        onPress={openModal}
      >
        <Text>버튼</Text>
      </Button>
      <PillModal visible={modalVisible} closeModal={closeModal} />
      {pilldata.map((pill) => (
        <View key={pill.id} style={{ margin: 8 }}>
          <Text>
            {pill.name} - {pill.dose} - {pill.time}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    width: 300,
    backgroundColor: "black",
  },
});
