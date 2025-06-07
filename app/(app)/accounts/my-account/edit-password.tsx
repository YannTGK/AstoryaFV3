import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import api from "@/services/api";
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

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isStrongPassword = (password: string) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const isFormValid =
    isStrongPassword(newPassword) &&
    newPassword !== oldPassword &&
    newPassword === confirmPassword;

  const handleSave = async () => {
    try {
      await api.put("/users/me/password", {
        oldPassword,
        newPassword,
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/(app)/explores/public");
      }, 4000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Error", msg);
    }
  };

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

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          Your new password must be at least 6 characters long and different from previously used password.
        </Text>

        {/* Old password */}
        <PasswordInput
          label="Old password"
          value={oldPassword}
          onChange={setOldPassword}
          visible={showOld}
          toggleVisibility={() => setShowOld((v) => !v)}
        />

        {/* New password */}
        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          visible={showNew}
          toggleVisibility={() => setShowNew((v) => !v)}
        />
        {newPassword.length > 0 && !isStrongPassword(newPassword) && (
          <Text style={styles.errorText}>
            Password must include upper/lowercase, number and special character.
          </Text>
        )}

        {/* Confirm password */}
        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirm}
          toggleVisibility={() => setShowConfirm((v) => !v)}
        />
        {confirmPassword.length > 0 && confirmPassword !== newPassword && (
          <Text style={styles.errorText}>Passwords do not match.</Text>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isFormValid}
          style={[
            styles.saveButton,
            isFormValid ? styles.saveButtonEnabled : styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
        >
          <Text
            style={[
              styles.saveButtonText,
              isFormValid ? styles.saveButtonTextEnabled : styles.saveButtonTextDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successPopup}>
            <Text style={styles.successText}>Password successfully changed!</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  toggleVisibility,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  visible: boolean;
  toggleVisibility: () => void;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor="#999"
        secureTextEntry={!visible}
        value={value}
        onChangeText={onChange}
      />
      <TouchableOpacity style={styles.eyeIcon} onPress={toggleVisibility}>
        {visible ? <EyeVisibleIcon width={22} height={22} /> : <EyeNotVisibleIcon width={22} height={22} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#000" },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "row",
    height: 44,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
  },
  container: {
    paddingTop: 124,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 24,
    fontFamily: "Alice-Regular",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 4,
    fontFamily: "Alice-Regular",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 32,
    padding: 4,
  },
  errorText: {
    color: "#FF7466",
    fontSize: 12,
    fontFamily: "Alice-Regular",
    marginTop: -8,
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  successPopup: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  successText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#000",
    textAlign: "center",
  },
});