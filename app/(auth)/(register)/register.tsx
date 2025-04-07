import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { useRouter } from "expo-router";
import CustomButton from "@/components/ui/Buttons/CustomButton";
import Span from "@/components/ui/Text/Span";
import InputField from "@/components/ui/Inputs/Input";
import useRegisterStore from "@/lib/store/UseRegisterStore";

export default function RegisterScreen(): JSX.Element {
  const router = useRouter();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dob, setDob] = useState<string>("");

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: "",
  });

  const { setUserInfo } = useRegisterStore();

  const validateFields = () => {
    const newErrors = {
      firstName: firstName.trim() ? "" : "Please enter a valid first name",
      lastName: lastName.trim() ? "" : "Please enter a valid last name",
      email: /^\S+@\S+\.\S+$/.test(email) ? "" : "Enter a valid email",
      phoneNumber: /^\+?[0-9\s]{8,15}$/.test(phoneNumber) ? "" : "Enter a valid phone number",
      dob: /^\d{2}\/\d{2}\/\d{4}$/.test(dob) ? "" : "Enter date as DD/MM/YYYY"
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const nextRegister = (): void => {
    if (!validateFields()) return;

    setUserInfo({ firstName, lastName, email, phoneNumber, dob });
    router.push("/(auth)/(register)/setPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headersLogin}>Welcome{"\n"}Create an account.</Text>
        </View>

        <View style={styles.inputSection}>
          <View>
            <InputField
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors(prev => ({ ...prev, firstName: "" }));
              }}
            />
            {errors.firstName ? <Span color="#FF7466">{errors.firstName}</Span> : null}
          </View>

          <View>
            <InputField
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors(prev => ({ ...prev, lastName: "" }));
              }}
            />
            {errors.lastName ? <Span color="#FF7466">{errors.lastName}</Span> : null}
          </View>

          <View>
            <InputField
              label="Email"
              placeholder="example@gmail.com"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: "" }));
              }}
            />
            {errors.email ? <Span color="#FF7466">{errors.email}</Span> : null}
          </View>

          <View>
            <InputField
              label="Phone Number"
              placeholder="+32 403 739 134"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setErrors(prev => ({ ...prev, phoneNumber: "" }));
              }}
            />
            {errors.phoneNumber ? <Span color="#FF7466">{errors.phoneNumber}</Span> : null}
          </View>

          <View>
            <InputField
              label="Date of Birth"
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
              value={dob}
              onChangeText={(text) => {
                setDob(text);
                setErrors(prev => ({ ...prev, dob: "" }));
              }}
            />
            {errors.dob ? <Span color="#FF7466">{errors.dob}</Span> : null}
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Continue"
              onPress={nextRegister}
              backgroundColor="#FEEDB6"
              textColor="#11152A"
            />
          </View>
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
  container: {
    flex: 1,
    backgroundColor: "#273166",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    gap: 32,
  },
  header: {
    marginTop: 20,
  },
  headersLogin: {
    fontSize: 32,
    color: "white",
    fontFamily: "Alice-Regular",
  },
  inputSection: {
    width: "100%",
    gap: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    gap: 24,
    marginBottom: 8,
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