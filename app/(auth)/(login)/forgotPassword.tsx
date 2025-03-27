import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CustomButton from "@/components/ui/Buttons/CustomButton";
import Span from "@/components/ui/Text/Span";
import InputField from "@/components/ui/Inputs/Input";
import BackButton from "@/components/ui/Buttons/BackButton";

export default function ForgotPasswordScreen(): JSX.Element {
  const router = useRouter();
  const [recoverMail, mailRecover] = useState("");

  const Recover = (): void => {
    router.replace("/(auth)/(login)/sendForgotPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.logoSection}>
        <Image
          style={styles.logo}
          source={require("@/assets/images/logo/LogoLogin.png")}
        />
        <Text style={styles.logoTitle}>Astorya</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headersLogin}>Forgot password</Text>
        <Span color="#fff">
          Enter your email address, we will send you instructions to reset your password.
        </Span>
      </View>

      {/* Form-sectie */}
      <View style={styles.holderSections}>
        <View style={styles.inputSection}>
          <View>
            <InputField
              label="Email"
              placeholder="example@gmail.com"
              value={recoverMail}
              onChangeText={mailRecover}
            />
            <Span color="#FF7466">Not a known eamil</Span>
          </View>

          <CustomButton
            title="Recover password"
            onPress={Recover}
            backgroundColor="#FEEDB6"
            textColor="#11152A"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#273166",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginTop: 20,
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
    textAlign: "center",
    color: "#fff",
    marginTop: 8,
  },
  headersLogin: {
    fontSize: 32,
    color: "white",
    fontFamily: "Alice-Regular",
  },
  holderSections: {
    gap: 8,
    marginTop: 16,
  },
  inputSection: {
    width: "100%",
    gap: 8,
  },
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