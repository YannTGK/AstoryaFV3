import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const [cardType, setCardType] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isFormComplete =
    cardType !== "" && cardNumber && cardholderName && expiryDate && cvv;

  const handleCardScan = () => {
    setCardType("debit");
    setCardNumber("1662 3446 4577 2189");
    setCardholderName("Maria Parker");
    setExpiryDate("02/27");
    setCvv("123");
    Alert.alert("Card scanned", "Your card details have been filled in.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Payment methods</Text>
        <Text style={styles.subTitle}>Add card</Text>

        {!showForm ? (
          <TouchableOpacity style={styles.cardBox} onPress={() => setShowForm(true)}>
            <Text style={styles.plus}>＋</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={cardType}
                  onValueChange={(itemValue: string) => setCardType(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a card" value="" />
                  <Picker.Item label="Debit card" value="debit" />
                  <Picker.Item label="Credit card" value="credit" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card number</Text>
              <TextInput
                style={styles.input}
                placeholder="Card number"
                placeholderTextColor="#999"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder name</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardholder name"
                placeholderTextColor="#999"
                value={cardholderName}
                onChangeText={setCardholderName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiry date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  placeholderTextColor="#999"
                  value={cvv}
                  onChangeText={setCvv}
                  secureTextEntry
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.readerButton} onPress={handleCardScan}>
              <Text style={styles.readerText}>Card reader</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, isFormComplete && styles.confirmButtonActive]}
              disabled={!isFormComplete}
            >
              <Text
                style={[styles.confirmButtonText, isFormComplete && styles.confirmButtonTextActive]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  scrollContainer: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginBottom: 20,
  },
  cardBox: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  plus: {
    fontSize: 48,
    color: "#fff",
  },
  label: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginBottom: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: "#000",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
  },
  picker: {
    height: 44,
    width: "100%",
    color: "#000",
  },
  row: {
    flexDirection: "row",
  },
  readerButton: {
    backgroundColor: "#1E1E2F",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  readerText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#666",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonActive: {
    backgroundColor: "#FEEDB6",
  },
  confirmButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#888",
  },
  confirmButtonTextActive: {
    color: "#000",
  },
});
