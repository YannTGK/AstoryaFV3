import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import PlusIcon from "@/assets/images/svg-icons/plus3.svg"; // ✅ juiste plus SVG

export default function AddPeopleDedicate() {
  const router = useRouter();
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const people = ["Annie", "Mary", "Louis", "Noah", "James"];

  const toggleSelect = (person: string) => {
    if (selectedPeople.includes(person)) {
      setSelectedPeople(selectedPeople.filter(p => p !== person));
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };

  const handleContinue = () => {
    router.push("/dedicates/created-dedicates/add-people/add-selected-people-dedicate");
  };

  const handleAddPerson = () => {
    router.push("/dedicates/created-dedicates/add-people/add-members-dedicate");
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      {/* Plus knop */}
      <TouchableOpacity style={styles.plusBtn} onPress={handleAddPerson}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      <Text style={styles.title}>Add people to star</Text>

      <Text style={styles.subtitle}>
        Select contacts to add to the star. To add someone new, tap the plus icon.
      </Text>

      <ScrollView style={{ marginTop: 20, marginBottom: 180 }}>
        {people.map((person, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, selectedPeople.includes(person) && styles.selectedOption]}
            onPress={() => toggleSelect(person)}
          >
            <Text style={styles.optionText}>@{person}</Text>
            <View style={selectedPeople.includes(person) ? styles.radioSelected : styles.radioUnselected} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue button VAST onderaan */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedPeople.length === 0 && { opacity: 0.6 }
          ]}
          disabled={selectedPeople.length === 0}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  plusBtn: {
    position: "absolute",
    top: 85,
    right: 24,
    zIndex: 10,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  subtitle: {
    marginTop: 60,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 30,
  },
  option: {
    marginTop: 12,
    backgroundColor: "#ffffff22",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    borderColor: "#FEEDB6",
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#fff",
  },
  radioUnselected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
  },
  radioSelected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FEEDB6",
    borderColor: "#FEEDB6",
    borderWidth: 2,
  },
  fixedButtonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
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
    color: "#11152A",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});
