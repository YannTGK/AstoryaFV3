import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAuthStore from "@/lib/store/useAuthStore";

const { width } = Dimensions.get("window");

export default function ChoseNameOption() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { emissive } = useLocalSearchParams(); // ✅ kleur van ster ontvangen

  const [selection, setSelection] = useState<"full" | "initials" | null>(null);

  const fullName = `${user?.firstName} ${user?.lastName}`;
  const initials = `${user?.firstName} ${user?.lastName?.[0] || ""}.`;

  const handleNext = () => {
    if (!selection) return;
    const selectedName = selection === "full" ? fullName : initials;

    router.push({
      pathname: "/(app)/my-stars/public-star/final-my-star-public",
      params: {
        name: selectedName,      // ✅ gekozen naam van gebruiker
        emissive: emissive as string, // ✅ kleur van ster behouden
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

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

      <Text style={styles.title}>My personal star</Text>
      <Text style={styles.subtitle}>Select what others will see on your public star:</Text>

      <TouchableOpacity
        style={[styles.option, selection === "full" && styles.selectedOption]}
        onPress={() => setSelection("full")}
      >
        <Text style={styles.optionText}>{fullName}</Text>
        <View style={selection === "full" ? styles.radioSelected : styles.radioUnselected} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, selection === "initials" && styles.selectedOption]}
        onPress={() => setSelection("initials")}
      >
        <Text style={styles.optionText}>{initials}</Text>
        <View style={selection === "initials" ? styles.radioSelected : styles.radioUnselected} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextButton, !selection && { opacity: 0.6 }]}
        onPress={handleNext}
        disabled={!selection}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
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
  subtitle: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 40,
  },
  option: {
    marginTop: 20,
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
  nextButton: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 40,
    marginHorizontal: 20,
  },
  nextText: {
    color: "#11152A",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});
