import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

export default function SendInvitationDedicate() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSendInvitation = () => {
    if (email.trim() || phoneNumber.trim()) {
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    router.back();
  };

  const isDisabled = !(email.trim() || phoneNumber.trim());

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Add members</Text>

      <Text style={styles.subtitle}>
        To send an invitation, please enter the email address or phone number of the person you want to invite.
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.formWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Johndoe@gmail.com"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 20 }]}>Phone number</Text>
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#999"
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isDisabled && { opacity: 0.6 }]}
          disabled={isDisabled}
          onPress={handleSendInvitation}
        >
          <Text style={styles.buttonText}>Send invitation</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Popup */}
      <Modal
        transparent
        visible={showPopup}
        animationType="fade"
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              An invitation has been sent to{" "}
              {email || phoneNumber}.
              {"\n"}Once {email ? "she" : "the person"} creates an account, you can find {email ? "her" : "the"} username by searching for {email ? "her" : "them"}.
            </Text>
            <TouchableOpacity style={styles.popupButton} onPress={handleClosePopup}>
              <Text style={styles.popupButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  subtitle: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginTop: 32,
    textAlign: "left",
    paddingHorizontal: 16,
  },
  formWrapper: {
    marginTop: 25,
    marginHorizontal: 16,
  },
  label: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
  },
button: {
  backgroundColor: "#FEEDB6",
  paddingVertical: 16,
  borderRadius: 8,
  position: "absolute",
  left: 20,
  right: 20,
  bottom: Platform.OS === "android" ? 100 : 100, // lager op Android
},
  buttonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  popupBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: 320,
  },
  popupText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
    marginBottom: 20,
  },
  popupButton: {
    marginTop: 10,
    backgroundColor: "#11152A",
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
    width: "50%",
  },
  popupButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});
