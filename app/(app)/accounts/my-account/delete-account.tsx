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

import EyeVisibleIcon from "@/assets/images/svg-icons/eye-visible.svg";
import EyeNotVisibleIcon from "@/assets/images/svg-icons/not-visible.svg";

export default function DeletePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValid = password.length > 0;

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

      {/* Header */}
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
        <Text style={styles.headerTitle}>Delete account</Text>
      </View>

      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.description}>
          To delete your account, you must first enter your current password.
        </Text>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeVisibleIcon width={22} height={22} />
            ) : (
              <EyeNotVisibleIcon width={22} height={22} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={!isValid}
          style={[
            styles.deleteButton,
            { marginTop: Platform.OS === "ios" ? 420 : 330 },
            isValid ? styles.deleteButtonActive : styles.deleteButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.deleteButtonText,
              isValid
                ? styles.deleteButtonTextActive
                : styles.deleteButtonTextDisabled,
            ]}
          >
            Delete
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
    fontSize: 16,
    color: "#fff",
    marginBottom: 32,
    fontFamily: "Alice-Regular",
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
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
    top: 10,
    padding: 4,
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonActive: {
    backgroundColor: "#FEEDB6",
  },
  deleteButtonDisabled: {
    backgroundColor: "#d8ccb0",
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  deleteButtonTextActive: {
    color: "#000",
  },
  deleteButtonTextDisabled: {
    color: "#7c715f",
  },
});
