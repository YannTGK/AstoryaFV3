import React, { useRef } from "react";
import {
  Animated,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

export default function TermsOfServiceScreen() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
          Effective Date: 08/06/2025{"\n\n"}

          1. About Astorya{"\n"}
          Astorya is a digital memorial platform that allows users to reserve stars, share memories, and leave messages for loved ones.{"\n\n"}

          2. User Eligibility{"\n"}
          • You must be at least 16 years old to use Astorya.{"\n"}
          • You agree to provide accurate and complete information when creating your account.{"\n\n"}

          3. Use of the Service{"\n"}
          • You may not use Astorya for any unlawful, harmful, or abusive activities.{"\n"}
          • You are responsible for the content you upload, including messages, memories, and images.{"\n"}
          • Content that is offensive, discriminatory, or disrespectful is strictly prohibited.{"\n\n"}

          4. Intellectual Property{"\n"}
          • All trademarks, logos, and designs of Astorya belong to us.{"\n"}
          • You retain ownership of the content you upload but grant Astorya a non-exclusive, worldwide license to display and host your content.{"\n\n"}

          5. Data and Availability{"\n"}
          • We aim to keep Astorya available 24/7 but cannot guarantee uninterrupted access.{"\n"}
          • We are not liable for data loss, interruptions, or technical issues.{"\n\n"}

          6. Termination{"\n"}
          • We reserve the right to suspend or terminate your account if you violate these Terms.{"\n"}
          • You can delete your account at any time through your profile settings.{"\n\n"}

          7. Changes to Terms{"\n"}
          • We may update these Terms from time to time. We will notify you of significant changes.{"\n\n"}

          8. Contact{"\n"}
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
