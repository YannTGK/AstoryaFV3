import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import ArrowDropdown from "@/assets/images/svg-icons/arrow-dropdown.svg";
import StarIcon from "@/assets/images/svg-icons/star.svg";

export default function AccountMembersStatusDedicate() {
  const router = useRouter();
  const [status, setStatus] = useState<"Can view" | "Can edit" | "Admin">("Can view");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          <Path
            d="M15 18l-6-6 6-6"
            stroke="#FEEDB6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <Text style={styles.title}>Members</Text>

        {/* Profile */}
        <View style={styles.profileWrapper}>
          <Image
            source={{ uri: "xxx" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>ELISABETH PARKER</Text>
          <Text style={styles.username}>@Elisabeth_251</Text>
        </View>

        {/* Status */}
        <Text style={styles.statusLabel}>Status</Text>

        <TouchableOpacity style={styles.dropdownButton} onPress={handleToggleDropdown}>
          <Text style={styles.dropdownButtonText}>{status}</Text>
          <ArrowDropdown width={16} height={16} />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownOptions}>
            {["Can view", "Can edit", "Admin"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionItem, status === option && styles.selectedOption]}
                onPress={() => handleSelectStatus(option as any)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Common Stars */}
        <Text style={styles.commonStarsLabel}>Common stars</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.starsRow}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          <View style={styles.starItem}>
            <StarIcon width={64} height={64} />
            <Text style={styles.starText}>Elina De Vos</Text>
          </View>
          <View style={styles.starItem}>
            <StarIcon width={64} height={64} />
            <Text style={styles.starText}>Merel De Bruyne</Text>
          </View>
          <View style={styles.starItem}>
            <StarIcon width={64} height={64} />
            <Text style={styles.starText}>X</Text>
          </View>
        </ScrollView>
      </ScrollView>
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
  profileWrapper: {
    marginTop: 40,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FEEDB6",
  },
  name: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  username: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: 4,
  },
  statusLabel: {
    marginTop: 40,
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
    color: "#fff",
  },
  commonStarsLabel: {
    marginTop: 40,
    marginHorizontal: 24,
    fontFamily: "Alice-Regular",
    color: "#fff",
    fontSize: 16,
  },
  starsRow: {
    marginTop: 20,
  },
  starItem: {
    alignItems: "center",
    marginRight: 20,
  },
  starText: {
    fontFamily: "Alice-Regular",
    fontSize: 12,
    color: "#fff",
    marginTop: 6,
  },
});
