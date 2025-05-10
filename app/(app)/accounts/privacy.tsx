import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PrivacyPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.text}>
        Here you can explain your privacy policy. This is a placeholder page.
      </Text>
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
