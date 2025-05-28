// screens/WriteMessage.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import api from "@/services/api";

export default function WriteMessage() {
  const router = useRouter();
  const { starId, roomId, msgId } = useLocalSearchParams<{
    starId?: string;
    roomId?: string;
    msgId?: string;
  }>();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!!msgId);
  const [submitting, setSubmitting] = useState(false);
  const editing = !!msgId;

  if (!starId || !roomId) {
    Alert.alert("Error", "Geen starId of roomId gevonden");
    router.back();
    return null;
  }

  useEffect(() => {
    if (editing) {
      api
        .get(
          `/stars/${starId}/three-d-rooms/${roomId}/messages/${msgId}`
        )
        .then((res) => setMessage(res.data.message))
        .catch((e) =>
          Alert.alert("Error", "Kon bericht niet laden")
        )
        .finally(() => setLoading(false));
    }
  }, [editing]);

  const canSubmit = message.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (editing) {
        await api.patch(
          `/stars/${starId}/three-d-rooms/${roomId}/messages/${msgId}`,
          { message, canView: [], canEdit: [] }
        );
      } else {
        await api.post(
          `/stars/${starId}/three-d-rooms/${roomId}/messages`,
          { message, canView: [], canEdit: [] }
        );
      }
      router.back();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Kon bericht niet versturen"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

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

      <Text style={styles.title}>{editing ? "Edit Message" : "New Message"}</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <View style={styles.formContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Write your message here..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              (!canSubmit || submitting) && styles.addButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            activeOpacity={canSubmit ? 0.8 : 1}
          >
            {submitting ? (
              <ActivityIndicator color="#11152A" />
            ) : (
              <Text style={styles.addText}>{editing ? "Update" : "Add"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  formContainer: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 160,
    paddingHorizontal: 20,
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  addButton: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addText: {
    color: "#11152A",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
});
