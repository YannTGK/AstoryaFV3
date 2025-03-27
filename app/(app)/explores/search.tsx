import { View, Text, StyleSheet, TextInput } from "react-native";

export default function SearchScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔎 Search Stars</Text>
      <TextInput
        style={styles.searchBox}
        placeholder="Search for a star..."
        placeholderTextColor="#aaa"
      />
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
  userText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  searchBox: {
    marginTop: 20,
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
});