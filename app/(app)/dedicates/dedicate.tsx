import React from "react";
import { View, Text, StyleSheet } from "react-native";
import useAuthStore from "@/lib/store/useAuthStore"; // import je store

export default function DedicateScreen() {
  const { user } = useAuthStore(); // haal de user uit de globale store

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>No user logged in.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 User Information</Text>
      <Text style={styles.label}>Name: <Text style={styles.value}>{user.firstName} {user.lastName}</Text></Text>
      <Text style={styles.label}>Email: <Text style={styles.value}>{user.email}</Text></Text>
      <Text style={styles.label}>Phone: <Text style={styles.value}>{user.phoneNumber}</Text></Text>
      <Text style={styles.label}>Date of Birth: <Text style={styles.value}>{new Date(user.dob).toLocaleDateString()}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#273166",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#273166",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    color: "#ccc",
    fontSize: 16,
  },
  value: {
    color: "#fff",
    fontWeight: "600",
  },
});