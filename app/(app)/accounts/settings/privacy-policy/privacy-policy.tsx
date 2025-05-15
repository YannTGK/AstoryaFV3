import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>Effective Date: 08/06/2025</Text>

        <Text style={styles.title}>1. Information we collect</Text>
        <Text style={styles.text}>- Account Information: First- and lastname, email, phone number, date of birth, and password.</Text>
        <Text style={styles.text}>- Profile Information: Profile pictures, messages, and memories you upload.</Text>
        <Text style={styles.text}>- Technical Data: Device information, IP address, and usage data.</Text>

        <Text style={styles.title}>2. How we use your information</Text>
        <Text style={styles.text}>- To create and manage your account.</Text>
        <Text style={styles.text}>- To allow you to make and reserve a star and create digital memories.</Text>
        <Text style={styles.text}>- To communicate with you about updates and support.</Text>

        <Text style={styles.title}>3. Sharing your information</Text>
        <Text style={styles.text}>- We do not sell your information.</Text>
        <Text style={styles.text}>- We may share your data with trusted third-party service providers (like hosting services) under strict confidentiality agreements.</Text>

        <Text style={styles.title}>4. Data Protection</Text>
        <Text style={styles.text}>- We use encryption and secure servers to protect your data.</Text>
        <Text style={styles.text}>- Access to your data is limited to authorised personnel only.</Text>

        <Text style={styles.title}>5. Your rights</Text>
        <Text style={styles.text}>You have the right to:</Text>
        <Text style={styles.text}>- Access, update, or delete your personal information.</Text>
        <Text style={styles.text}>- Withdraw consent at any time (this may affect your ability to use the app).</Text>
        <Text style={styles.text}>- Request a copy of your stored data.</Text>

        <Text style={styles.title}>6. Cookies and tracking</Text>
        <Text style={styles.text}>- We may use cookies to improve your experience.</Text>
        <Text style={styles.text}>- You can control cookies through your device settings.</Text>

        <Text style={styles.title}>7. Data Retention</Text>
        <Text style={styles.text}>- We retain your data for as long as your account is active or as needed to provide services.</Text>
        <Text style={styles.text}>- Upon account deletion, your personal data will be deleted within 30 days.</Text>

        <Text style={styles.title}>8. Changes to this privacy policy</Text>
        <Text style={styles.text}>- We may update this Privacy Policy occasionally. You will be notified of any major changes.</Text>

        <Text style={styles.title}>9. Contact</Text>
        <Text style={styles.text}>For questions about these Terms, please contact us at: Astorya.official@gmail.com</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
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
    paddingTop: 124,
    paddingBottom: 64,
    paddingHorizontal: 16,
  },
  date: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 16,
    fontFamily: "Alice-Regular",
  },
  title: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginTop: 20,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Alice-Regular",
    lineHeight: 20,
    marginBottom: 6,
  },
});
