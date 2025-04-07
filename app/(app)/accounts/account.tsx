import React from "react";
import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "@/lib/store/useAuthStore";

export default function AccountScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    logout(); // reset globale gebruiker + auth status
    router.replace("/(auth)/entry"); // navigeer naar startpagina
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Account Screen</Text>
      <Button title="Go to Home" onPress={() => router.push("/(app)/explores/public")} />
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="#FF5C5C" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#273166"
  },
  text: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
  },
});