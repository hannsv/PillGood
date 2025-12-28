import { Button, Modal, PaperProvider, Portal } from "react-native-paper";
import { StyleSheet, Text } from "react-native";
import { useState } from "react";

function AddPillModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  return (
    <PaperProvider>
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} style={styles.container}>
          <Text>Add Pill Modal</Text>
          <Button onPress={onDismiss}>Close</Button>
        </Modal>
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default AddPillModal;
