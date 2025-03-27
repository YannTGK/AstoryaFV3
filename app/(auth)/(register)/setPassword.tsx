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
import useRegisterStore from "@/lib/store/UseRegisterStore";
import useAuthStore from "@/lib/store/useAuthStore"; // ✅ Gebruik van useAuthStore
import CustomButton from "@/components/ui/Buttons/CustomButton";
import InputField from "@/components/ui/Inputs/Input";
import Span from "@/components/ui/Text/Span";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterPasswordScreen(): JSX.Element {
  const router = useRouter();
  const { firstName, lastName, email, phoneNumber, dob, reset } = useRegisterStore();
  const { setUser } = useAuthStore(); // ✅ Gebruik useAuthStore

  const [passwordSet, setPassword] = useState("");
  const [passwordCon, conPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirm: "" });
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const parseDate = (input: string): string | null => {
    const [day, month, year] = input.split("/");
    if (!day || !month || !year) return null;
    const isoDate = new Date(`${year}-${month}-${day}`);
    return isNaN(isoDate.getTime()) ? null : isoDate.toISOString();
  };

  const getPasswordChecks = (password: string) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
  });

  const validatePassword = (password: string): string => {
    const checks = getPasswordChecks(password);
    const allValid = Object.values(checks).every(Boolean);
    return allValid ? "" : "Password does not meet requirements";
  };

  const Register = async () => {
    const passwordError = validatePassword(passwordSet);
    const confirmError = passwordSet !== passwordCon ? "Passwords do not match" : "";

    setErrors({ password: passwordError, confirm: confirmError });
    if (passwordError || confirmError) return;

    const dobISO = parseDate(dob);
    if (!dobISO) {
      setErrors((prev) => ({ ...prev, confirm: "Invalid date format (DD/MM/YYYY)" }));
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        phoneNumber,
        dob: dobISO,
        password: passwordSet,
      });

      const { token } = response.data;
      await AsyncStorage.setItem("authToken", token);

      // ✅ Zet header en haal gebruiker op
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const meResponse = await api.get("/auth/me");
      setUser(meResponse.data.user);

      reset();
      router.replace("/(app)/explores/public");
    } catch (err: any) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      setErrors((prev) => ({
        ...prev,
        confirm: err.response?.data?.message || "Something went wrong",
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.headersLogin}>Create a password</Text>
        <View style={styles.inputSection}>
          <InputField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={passwordSet}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordChecks(getPasswordChecks(text));
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          {errors.password ? <Span color="#FF7466">{errors.password}</Span> : null}

          <InputField
            label="Confirm password"
            placeholder="Confirm your password"
            secureTextEntry
            value={passwordCon}
            onChangeText={(text) => {
              conPassword(text);
              setErrors((prev) => ({ ...prev, confirm: "" }));
            }}
          />
          {errors.confirm ? <Span color="#FF7466">{errors.confirm}</Span> : null}

          <CustomButton
            title="Sign up"
            onPress={Register}
            backgroundColor="#FEEDB6"
            textColor="#11152A"
          />
        </View>

        <View style={styles.requirements}>
          <View style={styles.requiredTop}>
            <Image source={require("@/assets/images/icons/warning-icon.png")} />
            <Span color="#797E97">Your password must include at least:</Span>
          </View>

          <Span color={passwordChecks.length ? "#67C4AF" : "#FF7466"}>• 8 characters</Span>
          <Span color={passwordChecks.uppercase ? "#67C4AF" : "#FF7466"}>• 1 uppercase letter</Span>
          <Span color={passwordChecks.number ? "#67C4AF" : "#FF7466"}>• 1 number</Span>
          <Span color={passwordChecks.special ? "#67C4AF" : "#FF7466"}>
            • 1 special character (e.g. !, @, #, $)
          </Span>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.iconHolder}>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={require("@/assets/images/logo/itsme.png")} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={require("@/assets/images/logo/Google.png")} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Image source={require("@/assets/images/logo/Facebook.png")} style={styles.icon} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.replace("/(auth)/(login)/login")}>
            <Span color="#fff">Do you already have an account? Log in</Span>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#273166" },
  listContent: { padding: 16, gap: 16 },
  headersLogin: { fontSize: 32, color: "white", fontFamily: "Alice-Regular" },
  inputSection: { gap: 8 },
  requirements: { marginTop: 8 },
  requiredTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    gap: 24,
    marginTop: 24,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#A0A0A0",
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#ffffff",
  },
  iconHolder: {
    flexDirection: "row",
    gap: 40,
  },
  iconButton: {
    borderRadius: 16,
    borderColor: "#fff",
    borderWidth: 1,
    padding: 16,
  },
  icon: {
    width: 32,
    height: 32,
  },
});