// accounts/settings.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SettingsPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.text}>Here you can manage your settings.</Text>
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
