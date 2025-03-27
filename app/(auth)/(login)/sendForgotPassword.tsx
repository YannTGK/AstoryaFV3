// SendForgotPasswordScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/ui/Buttons/CustomButton";
import Span from "@/components/ui/Text/Span";
import BackButton from "@/components/ui/Buttons/BackButton";

export default function SendForgotPasswordScreen(): JSX.Element {
  const [recoverMail, mailRecover] = useState("");

  const Resend = (): void => {
    console.log("Resend email");
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.logoSection}>
          <Image
            style={styles.logo}
            source={require("@/assets/images/logo/LogoLogin.png")}
          />
          <Text style={styles.logoTitle}>Astorya</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.headersLogin}>Email sent</Text>
          <Span color="#fff">
            Check your email. We have sent a link to your address to reset
            your password. Haven't received an email yet? Click to send a new one.
          </Span>
        </View>

        <View style={styles.holderSections}>
          <View style={styles.inputSection}>
            <CustomButton
              title="Send again"
              onPress={Resend}
              backgroundColor="#FEEDB6"
              textColor="#11152A"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#273166",
    paddingHorizontal: 16,
    gap: 16,
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
    color: "#fff",
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
});