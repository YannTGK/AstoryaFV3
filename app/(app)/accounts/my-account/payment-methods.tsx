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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Image } from "react-native";

const CARD_TYPES = [
  {
    label: "Debit card",
    value: "Debit",
    icon: require("@/assets/images/payment-cards/maestro.png"),
  },
  {
    label: "Mastercard",
    value: "mastercard",
    icon: require("@/assets/images/payment-cards/mastercard.png"),
  },
  {
    label: "Visa",
    value: "visa",
    icon: require("@/assets/images/payment-cards/visa.png"),
  },
  {
    label: "American Express",
    value: "amex",
    icon: require("@/assets/images/payment-cards/amex.png"),
  },
];

  

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const [cardType, setCardType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isFormComplete =
    cardType && cardNumber && cardholderName && expiryDate && cvv;

  const handleSelectCardType = (type: { label: string; value: string; icon: string }) => {
      setCardType(type.label);
      setShowDropdown(false);
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

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Payment methods</Text>
        <Text style={styles.subTitle}>Add card</Text>

        {!showForm ? (
          <TouchableOpacity style={styles.cardBox} onPress={() => setShowForm(true)}>
            <Text style={styles.plus}>＋</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Custom Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {cardType || "Select a card type"}
                </Text>
              </TouchableOpacity>
              {showDropdown && (
                <View style={styles.dropdownList}>
                  {CARD_TYPES.map((type) => (
  <TouchableOpacity
    key={type.value}
    style={styles.dropdownItem}
    onPress={() => handleSelectCardType(type)}
  >
    <View style={styles.dropdownItemContent}>
      <Image source={type.icon} style={styles.cardIcon} />
      <Text style={styles.dropdownItemText}>{type.label}</Text>
    </View>
  </TouchableOpacity>
))}


                </View>
              )}
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

            <TouchableOpacity
              style={[styles.confirmButton, isFormComplete && styles.confirmButtonActive]}
              disabled={!isFormComplete}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isFormComplete && styles.confirmButtonTextActive,
                ]}
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
  row: {
    flexDirection: "row",
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
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Alice-Regular",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    width: 24,
    height: 16,
    resizeMode: "contain",
    marginRight: 8,
  },
  dropdownItemText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#000",
  },
});
