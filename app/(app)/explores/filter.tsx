import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import Svg, { Path } from "react-native-svg";

export default function Filter() {
  const router = useRouter();

  const [dob, setDob] = useState("");
  const [dod, setDod] = useState("");
  const [country, setCountry] = useState("Belgium");
  const [coordinate, setCoordinate] = useState("");

  const handleApplyFilter = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Titel met backbutton gecentreerd */}
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#FEEDB6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>Filter stars</Text>
      </View>

      {/* Velden */}
      <Text style={styles.label}>Date of birth</Text>
      <TextInput
        placeholder="DD/MM/JJJJ"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={dob}
        onChangeText={setDob}
      />

      <Text style={styles.label}>Date of death</Text>
      <TextInput
        placeholder="DD/MM/JJJJ"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={dod}
        onChangeText={setDod}
      />

      <Text style={styles.label}>Country</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={country}
          onValueChange={(itemValue) => setCountry(itemValue)}
          style={styles.picker}
          dropdownIconColor="#000"
          mode="dropdown"
        >
          <Picker.Item label="Belgium" value="Belgium" />
          <Picker.Item label="Netherlands" value="Netherlands" />
          <Picker.Item label="France" value="France" />
          <Picker.Item label="Germany" value="Germany" />
        </Picker>
      </View>

      <Text style={styles.label}>Coördinate</Text>
      <TextInput
        placeholder="X(),Y(),Z()"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={coordinate}
        onChangeText={setCoordinate}
      />

      {/* Gele knop */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleApplyFilter}>
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1022",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    padding: 4,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Alice-Regular",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  picker: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    textAlignVertical: "center", 
    marginTop: -6, 
  },
  
  buttonWrapper: {
    marginTop: 25,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#FEEDB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});
