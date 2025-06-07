import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import api from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";

export default function VisibilityScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<"full" | "initials">("full");
  const [showVisitStatus, setShowVisitStatus] = useState(false);
  const [myStars, setMyStars] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyStars();
  }, []);

  const fetchMyStars = async () => {
    try {
      const res = await api.get("/stars");
      const stars = res.data.filter(
        (s: any) => user && s.userId === user._id && s.starFor !== "dedicate"
      );
      setMyStars(stars);
    } catch (err) {
      console.error("Fout bij ophalen van sterren:", err);
    }
  };

  const handleConfirm = async () => {
    try {
      const fullName = user ? `${user.firstName} ${user.lastName}` : '';
      const initials = user ? getInitials(user.firstName, user.lastName) : '';

      await Promise.all(
        myStars.map((star) =>
          api.put(`/stars/${star._id}`, {
            publicName: selectedOption === "full" ? fullName : initials,
          })
        )
      );

      router.back();
    } catch (err) {
      console.error("Fout bij opslaan van naam:", err);
    }
  };

  return (
    <View style={styles.wrapper}>
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

      <Text style={styles.title}>Visibility</Text>

      <View style={styles.form}>
        <Text style={styles.description}>
          Select what others will see on your public star:
        </Text>

        <RadioInput
          label="Full name:"
          value={`${user ? `${user.firstName} ${user.lastName}` : ''}`}
          selected={selectedOption === "full"}
          onSelect={() => setSelectedOption("full")}
        />

        <RadioInput
          label="Initials:"
          value={user ? getInitials(user.firstName, user.lastName) : ""}
          selected={selectedOption === "initials"}
          onSelect={() => setSelectedOption("initials")}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Extra:</Text>
        <View style={styles.extraRow}>
          <Switch
            value={showVisitStatus}
            onValueChange={setShowVisitStatus}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={showVisitStatus ? "#fff" : "#ccc"}
          />
          <Text style={styles.extraText}>
            People can see when I’m visiting a star
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

function RadioInput({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.inputWrapper} onPress={onSelect} activeOpacity={0.8}>
        <Text style={styles.inputText}>{value}</Text>
        <View style={[styles.circle, selected && styles.circleSelected]} />
      </TouchableOpacity>
    </View>
  );
}

function getInitials(first: string, last: string): string {
  const lastInitials = (last ?? "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .filter(Boolean)
    .join(".");

  return `${first} ${lastInitials}.`;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  form: {
    paddingHorizontal: 16,
  },
  description: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Alice-Regular",
    marginTop: 20,
    marginBottom: 24,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Alice-Regular",
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: "rgba(196, 196, 196, 0.3)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  circleSelected: {
    backgroundColor: "#FEEDB6",
    borderColor: "#FEEDB6",
  },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  extraText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 16,
    fontFamily: "Alice-Regular",
    flexShrink: 1,
  },
  confirmBtn: {
    marginTop: 250,
    marginHorizontal: 16,
    backgroundColor: "#FEEDB6",
    paddingVertical: 16,
    borderRadius: 8,
  },
  confirmText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Alice-Regular",
    textAlign: "center",
    fontWeight: "600",
  },
});