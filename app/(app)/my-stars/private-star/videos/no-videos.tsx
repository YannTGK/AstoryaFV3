// my-stars/private-star/videos/no-videos.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NoVideosPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Videos</Text>
      <Text style={styles.text}>You don’t have any videos yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#11152A",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Alice-Regular",
    color: "#FEEDB6",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#fff",
  },
});
