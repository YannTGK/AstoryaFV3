import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";

import InputField   from "@/components/ui/Inputs/Input";
import CustomButton from "@/components/ui/Buttons/CustomButton";
import Span         from "@/components/ui/Text/Span";
import useRegisterStore from "@/lib/store/UseRegisterStore";

export default function RegisterScreen(): JSX.Element {
  const router = useRouter();

  /* -------- veldwaarden -------- */
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [username,  setUsername]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [dob,       setDob]       = useState("");
  const [cca2,      setCca2]      = useState<CountryCode>("BE");
  const [country,   setCountry]   = useState("Belgium");

  const [errors, setErrors] = useState({
    firstName: "",
    lastName:  "",
    username:  "",
    email:     "",
    phone:     "",
    dob:       "",
  });

  const { setUserInfo } = useRegisterStore();

  /* -------- validatie -------- */
  const validate = () => {
    const e = {
      firstName: firstName.trim() ? "" : "Please enter a first name",
      lastName : lastName.trim()  ? "" : "Please enter a last name",
      username : username.trim()  ? "" : "Please enter a username",
      email    : /^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email",
      phone    : /^\+?[0-9\s]{8,15}$/.test(phone) ? "" : "Enter a valid phone",
      dob      : /^\d{2}\/\d{2}\/\d{4}$/.test(dob) ? "" : "Use DD/MM/YYYY",
    };
    setErrors(e);
    return Object.values(e).every((v) => v === "");
  };

  /* -------- land selecteren -------- */
  const onSelect = (c: Country) => {
    setCca2(c.cca2 as CountryCode);
    setCountry(c.name);
  };

  /* -------- verder -------- */
  const next = () => {
    if (!validate()) return;

    setUserInfo({
      firstName,
      lastName,
      username: username.trim().toLowerCase(),
      email:    email.toLowerCase(),
      phoneNumber: phone,
      dob,
      country,
    });

    router.push("/(auth)/(register)/setPassword");
  };

  /* -------- UI -------- */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>Welcome{"\n"}Create an account.</Text>

        <View style={styles.section}>
          {/* ── tekstvelden ─────────────────────────── */}
          <InputField
            label="First Name"
            value={firstName}
            placeholder="Enter first name"
            onChangeText={(t) => {
              setFirstName(t);
              setErrors((p) => ({ ...p, firstName: "" }));
            }}
          />
          {errors.firstName ? <Span color="#FF7466">{errors.firstName}</Span> : null}

          <InputField
            label="Last Name"
            value={lastName}
            placeholder="Enter last name"
            onChangeText={(t) => {
              setLastName(t);
              setErrors((p) => ({ ...p, lastName: "" }));
            }}
          />
          {errors.lastName ? <Span color="#FF7466">{errors.lastName}</Span> : null}

          <InputField
            label="Username"
            value={username}
            placeholder="Enter username"
            onChangeText={(t) => {
              setUsername(t);
              setErrors((p) => ({ ...p, username: "" }));
            }}
          />
          {errors.username ? <Span color="#FF7466">{errors.username}</Span> : null}

          {/* ── land picker ───────────────────────────── */}
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.countryBox}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <CountryPicker
              countryCode={cca2}
              withFilter
              withFlag
              withCountryNameButton
              withCallingCodeButton={false}
              onSelect={onSelect}
            />
          </TouchableOpacity>

          <InputField
            label="Email"
            value={email}
            placeholder="example@gmail.com"
            keyboardType="email-address"
            onChangeText={(t) => {
              setEmail(t);
              setErrors((p) => ({ ...p, email: "" }));
            }}
          />
          {errors.email ? <Span color="#FF7466">{errors.email}</Span> : null}

          <InputField
            label="Phone Number"
            value={phone}
            placeholder="+32 123 456 789"
            keyboardType="phone-pad"
            onChangeText={(t) => {
              setPhone(t);
              setErrors((p) => ({ ...p, phone: "" }));
            }}
          />
          {errors.phone ? <Span color="#FF7466">{errors.phone}</Span> : null}

          <InputField
            label="Date of Birth"
            value={dob}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            onChangeText={(t) => {
              setDob(t);
              setErrors((p) => ({ ...p, dob: "" }));
            }}
          />
          {errors.dob ? <Span color="#FF7466">{errors.dob}</Span> : null}

          <CustomButton
            title="Continue"
            onPress={next}
            backgroundColor="#FEEDB6"
            textColor="#11152A"
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#273166" },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  h1: {
    fontSize: 32,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginTop: 20,
    marginBottom: 24,
  },
  section: { gap: 16 },
  label: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Alice-Regular",
    marginBottom: -10,
  },
  countryBox: {
    height: 44,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});