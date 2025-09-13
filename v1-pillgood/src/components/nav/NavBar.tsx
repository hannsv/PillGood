import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function NavBar() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My App</Text>
      <View style={styles.buttonContainer}>
        <Button title="Home" onPress={() => {}} />
        <Button title="Profile" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
  },
});
