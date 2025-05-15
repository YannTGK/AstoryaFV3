import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

// Import jouw twee oog-iconen
import EyeVisibleIcon from "@/assets/images/svg-icons/eye-visible.svg";
import EyeNotVisibleIcon from "@/assets/images/svg-icons/not-visible.svg";

export default function EditPasswordScreen() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isFormValid =
    newPassword.length >= 6 &&
    newPassword !== oldPassword &&
    newPassword === confirmPassword;

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header met back button en gecentreerde titel */}
      <View style={styles.header}>
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
        <Text style={styles.headerTitle}>Edit password</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.description}>
          Your new password must be at least 6 characters long and different from previously used password.
        </Text>

        {/* Old password input */}
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="Old password"
            placeholderTextColor="#999"
            secureTextEntry={!showOld}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowOld(!showOld)}
          >
            {showOld ? (
              <EyeVisibleIcon width={22} height={22} />
            ) : (
              <EyeNotVisibleIcon width={22} height={22} />
            )}
          </TouchableOpacity>
        </View>

        {/* New password input */}
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNew(!showNew)}
          >
            {showNew ? (
              <EyeVisibleIcon width={22} height={22} />
            ) : (
              <EyeNotVisibleIcon width={22} height={22} />
            )}
          </TouchableOpacity>
        </View>

        {/* Confirm password input */}
        <View style={{ position: "relative" }}>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? (
              <EyeVisibleIcon width={22} height={22} />
            ) : (
              <EyeNotVisibleIcon width={22} height={22} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={!isFormValid}
          style={[
            styles.saveButton,
            !isFormValid ? styles.saveButtonDisabled : styles.saveButtonEnabled,
          ]}
        >
          <Text
            style={[
              styles.saveButtonText,
              !isFormValid ? styles.saveButtonTextDisabled : styles.saveButtonTextEnabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: 44,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
  },
  container: {
    flex: 1,
    paddingTop: 124,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: "Alice-Regular",
  },
  label: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 6,
    fontFamily: "Alice-Regular",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 10,
    padding: 4,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: Platform.OS === "ios" ? 300 : 220,
    alignItems: "center",
  },
  saveButtonEnabled: {
    backgroundColor: "#FEEDB6",
  },
  saveButtonDisabled: {
    backgroundColor: "#d8ccb0",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  saveButtonTextEnabled: {
    color: "#000",
  },
  saveButtonTextDisabled: {
    color: "#7c715f",
  },
});
