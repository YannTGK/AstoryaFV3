// app/(auth)/(register)/setPassword.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useRegisterStore from "@/lib/store/UseRegisterStore";
import useAuthStore     from "@/lib/store/useAuthStore";
import CustomButton     from "@/components/ui/Buttons/CustomButton";
import InputField       from "@/components/ui/Inputs/Input";
import Span             from "@/components/ui/Text/Span";
import api              from "@/services/api";

export default function RegisterPasswordScreen(): JSX.Element {
  const router = useRouter();
  const {
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    dob,
    country,
    reset,
  } = useRegisterStore();
  const { setUser } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [errors, setErrors]     = useState({ password: "", confirm: "" });
  const [checks, setChecks]     = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const parseDob = (input: string): string | null => {
    const [d, m, y] = input.split("/");
    if (!d || !m || !y) return null;
    const date = new Date(`${y}-${m}-${d}`);
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

  const makeChecks = (pw: string) => ({
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /\d/.test(pw),
    special:   /[!@#$%^&*]/.test(pw),
  });

  const validatePassword = (pw: string): string => {
    const c = makeChecks(pw);
    setChecks(c);
    return Object.values(c).every(Boolean)
      ? ""
      : "Password must be ≥8 chars, include uppercase, number & special";
  };

  const handleSignUp = async () => {
    const pwdError = validatePassword(password);
    const confError = password !== confirm ? "Passwords do not match" : "";

    setErrors({ password: pwdError, confirm: confError });
    if (pwdError || confError) return;

    const dobIso = parseDob(dob);
    if (!dobIso) {
      setErrors((e) => ({ ...e, confirm: "Invalid DOB format" }));
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        dob: dobIso,
        country,
        password,
      });

      const { token } = res.data;
      await AsyncStorage.setItem("authToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const me = await api.get("/auth/me");
      setUser(me.data.user);

      reset();
      router.replace("/(app)/explores/public");
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Registration failed";
      setErrors((e) => ({ ...e, confirm: msg }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Create a password</Text>

        <View style={styles.section}>
          <InputField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrors((e) => ({ ...e, password: "" }));
              setChecks(makeChecks(t));
            }}
          />
          {errors.password ? <Span color="#FF7466">{errors.password}</Span> : null}

          <InputField
            label="Confirm Password"
            placeholder="Re-enter your password"
            secureTextEntry
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              setErrors((e) => ({ ...e, confirm: "" }));
            }}
          />
          {errors.confirm ? <Span color="#FF7466">{errors.confirm}</Span> : null}

          <CustomButton
            title="Sign up"
            onPress={handleSignUp}
            backgroundColor="#FEEDB6"
            textColor="#11152A"
            style={{ marginTop: 16 }}
          />
        </View>

        <View style={styles.checklist}>
          <View style={styles.checkRow}>
            <Image source={require("@/assets/images/icons/warning-icon.png")} />
            <Span color="#797E97">Your password must include:</Span>
          </View>
          <Span color={checks.length    ? "#67C4AF" : "#FF7466"}>• At least 8 characters</Span>
          <Span color={checks.uppercase ? "#67C4AF" : "#FF7466"}>• One uppercase letter</Span>
          <Span color={checks.number    ? "#67C4AF" : "#FF7466"}>• One number</Span>
          <Span color={checks.special   ? "#67C4AF" : "#FF7466"}>• One special character (!@#$%^&*)</Span>
        </View>

        <View style={styles.bottomLink}>
          <TouchableOpacity onPress={() => router.replace("/(auth)/(login)/login")}>
            <Span color="#fff">Already have an account? Log in</Span>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#273166" },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  header: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginTop: 20,
    marginBottom: 16,
  },
  section: { gap: 16 },
  checklist: { marginTop: 24, gap: 8 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  bottomLink: { marginTop: 32, alignItems: "center" },
});