import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NoAudios() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No audio files found.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
});
