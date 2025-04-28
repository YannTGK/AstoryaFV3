import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import ArrowDropdown from "@/assets/images/svg-icons/arrow-dropdown.svg"; // ✅ correcte arrow

export default function AddSelectedPeopleDedicate() {
  const router = useRouter();

  const [status, setStatus] = useState<"Can view" | "Can edit" | "Admin">("Can view");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedPerson = "Annie";

  const handleAddToStar = () => {
    console.log(`Added ${selectedPerson} with status: ${status}`);
    router.back();
  };

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectStatus = (option: "Can view" | "Can edit" | "Admin") => {
    setStatus(option);
    setDropdownOpen(false);
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

      <Text style={styles.title}>Add people to star</Text>

      {/* Geselecteerde persoon */}
      <View style={styles.personRow}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.personName}>@{selectedPerson}</Text>
      </View>

      <Text style={styles.statusLabel}>Status</Text>

      {/* Dropdown */}
      <TouchableOpacity style={styles.dropdownButton} onPress={handleToggleDropdown}>
        <Text style={styles.dropdownButtonText}>{status}</Text>
        <ArrowDropdown width={16} height={16} />
      </TouchableOpacity>

      {/* Dropdown opties */}
      {dropdownOpen && (
        <View style={styles.dropdownOptions}>
          {["Can view", "Can edit", "Admin"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionItem, status === option && styles.selectedOption]}
              onPress={() => handleSelectStatus(option as any)}
            >
              <Text style={styles.optionText}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add to star button */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleAddToStar}>
          <Text style={styles.buttonText}>Add to star</Text>
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
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginHorizontal: 24,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5B5B5B",
    marginRight: 10,
  },
  personName: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  statusLabel: {
    marginTop: 30,
    marginHorizontal: 24,
    fontFamily: "Alice-Regular",
    color: "#fff",
    fontSize: 16,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
  },
  dropdownOptions: {
    marginTop: 10,
    marginHorizontal: 24,
  },
  optionItem: {
    backgroundColor: "#ffffff22",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
  },
  selectedOption: {
    borderWidth: 1.5,
    borderColor: "#FEEDB6",
  },
  optionText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff", // altijd wit!
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
