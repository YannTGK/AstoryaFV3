import { View, Text, StyleSheet } from "react-native";

export default function PrivateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Private Stars</Text>
      <Text style={styles.description}>View stars that are only accessible to you and invited users.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#273166",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});