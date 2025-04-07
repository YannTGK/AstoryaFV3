import React, { useState } from "react";
import api from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomButton from "@/components/ui/Buttons/CustomButton";
import Span from "@/components/ui/Text/Span";
import InputField from "@/components/ui/Inputs/Input";

export default function LoginScreen(): JSX.Element {
  const router = useRouter();

  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const handleLogin = async (): Promise<void> => {
    setEmailError(false);
    setLoginError(false);

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token } = response.data;

      // ⬇️ Zet token in global store en header
      await AsyncStorage.setItem("authToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setToken(token);

      // ⬇️ Haal gebruiker op en sla op in globale store
      const meResponse = await api.get("/auth/me");
      setUser(meResponse.data.user);

      // ✅ Ga naar home
      router.replace("/(app)/explores/public");
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      setLoginError(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo & Header Section */}
      <View style={styles.logoSection}>
        <Image
          style={styles.logo}
          source={require("@/assets/images/logo/LogoLogin.png")}
        />
        <Text style={styles.logoTitle}>Astorya</Text>
      </View>

      {/* Login Fields Section */}
      <View style={styles.loginSection}>
        <Text style={styles.headersLogin}>
          Welcome back!{"\n"}Log in.
        </Text>
        <View style={styles.holder16gap}>
          <View style={styles.holder8gap}>
            <InputField
              label="Email"
              placeholder="ilias@test.com"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(false);
              }}
            />
            {emailError && <Span color="#FF7466">Please enter a valid email</Span>}

            <InputField
              label="Password"
              placeholder="Test1234*"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLoginError(false);
              }}
            />
            <View style={styles.holderLabelDuo}>
              <Span color="#FF7466">
                {loginError ? "Password or username incorrect" : " "}
              </Span>
              <TouchableOpacity onPress={() => router.push("/(auth)/(login)/forgotPassword")}>
                <Span>Forgot password</Span>
              </TouchableOpacity>
            </View>
          </View>
          <CustomButton
            title="Login"
            onPress={handleLogin}
            backgroundColor="#FEEDB6"
            textColor="#11152A"
          />
        </View>
      </View>

      {/* Bottom Section */}
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
        <TouchableOpacity onPress={() => router.replace("/(auth)/(register)/register")}>
          <Span color="#fff">Don't have an account yet? Sign up</Span>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#273166",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 50,
    height: 76,
  },
  logoTitle: {
    fontSize: 24,
    fontFamily: "Alice-Regular",
    color: "#fff",
    marginTop: 8,
  },
  loginSection: {
    width: "100%",
    gap: 24,
  },
  headersLogin: {
    fontSize: 32,
    color: "white",
    fontFamily: "Alice-Regular",
  },
  holder16gap: { gap: 16 },
  holder8gap: { gap: 8 },
  holderLabelDuo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#ffffff",
    fontFamily: "Alice-Regular",
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