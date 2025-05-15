import React, { useRef } from "react";
import {
  Animated,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
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
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Text style={styles.text}>
          Effective Date: 04/05/2025{"\n\n"}

          1. Information we collect:{"\n"}
          • Account Information: First- and lastname, email, phone number, date of birth, and password.{"\n"}
          • Profile Information: Profile pictures, messages, and memories you upload.{"\n"}
          • Technical Data: Device information, IP address, and usage data.{"\n\n"}

          2. How we use your information:{"\n"}
          • To create and manage your account.{"\n"}
          • To allow you to make and reserve a star and create digital memories.{"\n"}
          • To communicate with you about updates and support.{"\n\n"}

          3. Sharing your information:{"\n"}
          • We do not sell your information.{"\n"}
          • We may share your data with trusted third-party service providers under strict confidentiality agreements.{"\n\n"}

          4. Data Protection:{"\n"}
          • We use encryption and secure servers to protect your data.{"\n"}
          • Access to your data is limited to authorized personnel only.{"\n\n"}

          5. Your rights:{"\n"}
          You have the right to:{"\n"}
          • Access, update, or delete your personal information.{"\n"}
          • Withdraw consent at any time (this may affect your ability to use the app).{"\n"}
          • Request a copy of your stored data.{"\n\n"}

          6. Cookies and tracking:{"\n"}
          • We may use cookies to improve your experience.{"\n"}
          • You can control cookies through your device settings.{"\n\n"}

          7. Data Retention:{"\n"}
          • We retain your data for as long as your account is active or as needed to provide services.{"\n"}
          • Upon account deletion, your personal data will be deleted within 30 days.{"\n\n"}

          8. Changes to this privacy policy:{"\n"}
          • We may update this Privacy Policy occasionally. You will be notified of any major changes.{"\n\n"}

          9. Contact:{"\n"}
          For questions about these Terms, please contact us at: Astorya.official@gmail.com
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 124,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  text: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Alice-Regular",
    lineHeight: 22,
  },
});
