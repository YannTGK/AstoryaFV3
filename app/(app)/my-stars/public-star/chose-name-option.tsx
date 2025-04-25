import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useRouter, useLocalSearchParams } from "expo-router";

import useAuthStore from "@/lib/store/useAuthStore";
import { createStar } from "@/services/stars";

export default function ChoseNameOption() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { emissive, name: colorName } = useLocalSearchParams();   // ← kleur-label (‘HOPE’)

  const [selection, setSelection] = useState<"full" | "initials" | null>(null);
  const [loading, setLoading] = useState(false);

  const fullName = `${user?.firstName} ${user?.lastName}`;
  const initials = `${user?.firstName} ${user?.lastName?.[0] || ""}.`;

  const handleNext = async () => {
    if (!selection || loading) return;
    const selectedName = selection === "full" ? fullName : initials;

    /* decimaal emissive → #rrggbb */
    const colorHex = `#${Number(emissive).toString(16).padStart(6, "0")}`;

    try {
      setLoading(true);

      await createStar({
        word: (colorName as string).toUpperCase(),   // ✔︎ kleur-naam als ‘word’
        color: colorHex,
        isPrivate: false,
        publicName: selectedName,
      });

      router.replace({
        pathname: "/(app)/my-stars/public-star/final-my-star-public",
        params: { name: selectedName, emissive: emissive as string },
      });
    } catch (err) {
      console.error("Public star aanmaken mislukt:", err);
      Alert.alert(
        "Opslaan mislukte",
        "Er ging iets mis bij het opslaan. Probeer het later opnieuw."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------- UI ------------------------------ */
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* back */}
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
      <Text style={styles.subtitle}>
        Select what others will see on your public star:
      </Text>

      {/* volledige naam */}
      <TouchableOpacity
        style={[styles.option, selection === "full" && styles.selectedOption]}
        onPress={() => setSelection("full")}
      >
        <Text style={styles.optionText}>{fullName}</Text>
        <View
          style={
            selection === "full" ? styles.radioSelected : styles.radioUnselected
          }
        />
      </TouchableOpacity>

      {/* initialen */}
      <TouchableOpacity
        style={[
          styles.option,
          selection === "initials" && styles.selectedOption,
        ]}
        onPress={() => setSelection("initials")}
      >
        <Text style={styles.optionText}>{initials}</Text>
        <View
          style={
            selection === "initials"
              ? styles.radioSelected
              : styles.radioUnselected
          }
        />
      </TouchableOpacity>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.nextButton, (!selection || loading) && { opacity: 0.6 }]}
        onPress={handleNext}
        disabled={!selection || loading}
      >
        <Text style={styles.nextText}>{loading ? "Saving..." : "Next"}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------------------- styles ---------------------------- */
const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },

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
  selectedOption: { borderColor: "#FEEDB6", borderWidth: 1.5 },

  optionText: { fontSize: 16, fontFamily: "Alice-Regular", color: "#fff" },

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