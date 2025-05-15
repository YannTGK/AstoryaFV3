import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("English");

const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.description}>
          Choose the language you want the app to be in.
        </Text>

        {['English', 'Nederlands', 'Français', 'Deutsch'].map((lang) => (
          <View key={lang} style={styles.switchRow}>
            <Text style={styles.label}>{lang}</Text>
            <Switch
              value={selectedLanguage === lang}
              onValueChange={() => handleLanguageChange(lang)}
              trackColor={{ false: "#888", true: "#FEEDB6" }}
              thumbColor={
                Platform.OS === "android"
                  ? selectedLanguage === lang
                    ? "#000"
                    : "#fff"
                  : undefined
              }
            />
          </View>
        ))}
      </View>
    </View>
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
});
