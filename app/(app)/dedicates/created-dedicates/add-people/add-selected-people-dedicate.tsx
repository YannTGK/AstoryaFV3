import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

import ArrowDropdown from "@/assets/images/svg-icons/arrow-dropdown.svg";
import api from "@/services/api";

export default function AddSelectedPeopleDedicate() {
  const router = useRouter();
  const { starId, userId, username } = useLocalSearchParams<{
    starId: string;
    userId: string;
    username: string;
  }>();

  // Alleen deze twee statussen
  const [status, setStatus] = useState<"Can view" | "Can edit">("Can view");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [already, setAlready] = useState(false);
  const [loading, setLoading] = useState(true);

  const modeMap = {
    "Can view": "view",
    "Can edit": "edit",
  } as const;

  // 1) bij mount ophalen of gebruiker al rechten heeft én huidige rol bepalen
  useEffect(() => {
    (async () => {
      try {
        const { star } = (await api.get(`/stars/${starId}`)).data;
        const isOwner   = String(star.userId) === userId;
        const meCanEdit = star.canEdit?.includes(userId);
        const meCanView = star.canView?.includes(userId);

        if (isOwner || meCanEdit) {
          // Owner én editors krijgen "Can edit" én disabled
          setStatus("Can edit");
          setAlready(true);
        } else if (meCanView) {
          setStatus("Can view");
          setAlready(true);
        } else {
          // Nog geen rechten → mag dropdown openen, default view
          setStatus("Can view");
          setAlready(false);
        }
      } catch (e) {
        console.error("Failed fetching star rights:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [starId, userId]);

  const handleAddToStar = async () => {
    if (saving || already) return;
    setSaving(true);

    try {
      await api.patch(`/stars/${starId}/rights`, {
        userId,
        mode: modeMap[status],
        action: "add",
      });
      Alert.alert(
        "Toegevoegd",
        `@${username} is toegevoegd als ${status}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Server error";
      Alert.alert("Fout", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { flex: 1 }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ← Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Add people to star</Text>

      {/* Persoon */}
      <View style={styles.personRow}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.personName}>@{username}</Text>
      </View>

      <Text style={styles.statusLabel}>Status</Text>

      {/* Dropdown-button: disabled als already */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => !already && setDropdownOpen(!dropdownOpen)}
        disabled={already}
      >
        <Text style={styles.dropdownButtonText}>{status}</Text>
        <ArrowDropdown width={16} height={16} />
      </TouchableOpacity>

      {/* Alleen tonen als niet al toegevoegd én dropdown open */}
      {!already && dropdownOpen && (
        <View style={styles.dropdownOptions}>
          {(["Can view", "Can edit"] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionItem,
                status === opt && styles.selectedOption,
              ]}
              onPress={() => {
                setStatus(opt);
                setDropdownOpen(false);
              }}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CTA */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[styles.button, (saving || already) && { opacity: 0.6 }]}
          onPress={handleAddToStar}
          disabled={saving || already}
        >
          <Text style={styles.buttonText}>
            {already ? "Al toegevoegd" : saving ? "Bezig…" : "Add to star"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
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
    color: "#fff",
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