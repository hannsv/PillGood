import { Button, Modal, Portal, Text, TextInput } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useState } from "react";

function AddPillModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const [pillName, setPillName] = useState("");

  const handleSearch = () => {
    console.log("Searching for pill:", pillName);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <Text variant="titleLarge" style={{ marginBottom: 20 }}>
          약 등록
        </Text>
        <TextInput
          label="약 이름"
          value={pillName}
          onChangeText={setPillName}
          style={{ marginBottom: 10 }}
        />
        <Button
          onPress={handleSearch}
          mode="contained"
          style={{ marginBottom: 10 }}
        >
          검색
        </Button>
        <Button onPress={onDismiss}>닫기</Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

export default AddPillModal;
