// mijn profiel
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import useAuthStore from "@/lib/store/useAuthStore";

export default function MyProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [dob, setDob] = useState(formatDate(user?.dob ?? ""));
  const language = "English";

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

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

      <Text style={styles.title}>My profile</Text>

      <View style={styles.form}>
        <Input label="First name:" value={firstName} onChangeText={setFirstName} />
        <Input label="Last name:" value={lastName} onChangeText={setLastName} />
        <Input label="Email:" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Phone number:" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <Input label="Date of birth:" value={dob} onChangeText={setDob} placeholder="28/09/1968" />
        <Input label="Language:" value={language} editable={false} />
      </View>

      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (val: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  editable?: boolean;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.readOnly]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  form: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Alice-Regular",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    color: "rgba(60, 60, 67, 0.5)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  readOnly: {
    backgroundColor: "#ddd",
    color: "#555",
  },
  saveBtn: {
    marginTop: 130,
    backgroundColor: "#FEEDB6",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 16,
  },
  saveText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});
