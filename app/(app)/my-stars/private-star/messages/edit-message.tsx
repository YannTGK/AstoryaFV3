import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useState } from "react";

export default function WriteMessage() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");

  const allFieldsFilled = from.trim() && to.trim() && message.trim();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-button */}
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

      {/* Titel */}
      <Text style={styles.title}>Messages</Text>

      {/* Scrollbare inputvelden */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* From */}
          <TextInput
            style={styles.input}
            placeholder="From: ..."
            placeholderTextColor="#888"
            value={from}
            onChangeText={setFrom}
          />

          {/* To + plus2 */}
          <View style={styles.inputWithIcon}>
            <TextInput
              style={styles.inputWithPadding}
              placeholder="To: ..."
              placeholderTextColor="#888"
              value={to}
              onChangeText={setTo}
            />
          </View>

          {/* Message */}
          <TextInput
            style={styles.textArea}
            placeholder="Write your message here:"
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gefixeerde Add-knop */}
      <View style={styles.addWrapper}>
        <TouchableOpacity
          style={[
            styles.addButton,
            !allFieldsFilled && styles.addButtonDisabled,
          ]}
          onPress={() => {
            if (allFieldsFilled) {
                router.push({
                    pathname: "/(app)/my-stars/private-star/messages/add-message",
                    params: { to, from, message },
                  });                  
            }
          }}
          disabled={!allFieldsFilled}
          activeOpacity={allFieldsFilled ? 0.8 : 1}
        >
          <Text style={styles.addText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  formContainer: {
    paddingTop: 40,
    paddingBottom: 160,
    paddingHorizontal: 20,
    gap: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
  },
  inputWithIcon: {
    position: "relative",
    justifyContent: "center",
  },
  inputWithPadding: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 44,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
  },
  iconInside: {
    position: "absolute",
    right: 8,
    top: "35%",
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 10,
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
    height: 200,
  },
  addWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  addButton: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addText: {
    color: "#11152A",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
});
