import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import type { ImageSourcePropType } from "react-native";
import TrashIcon from "@/assets/images/svg-icons/trash-white.svg";

const isValidCardNumber = (num: string) =>
  /^\d{16}$/.test(num.replace(/\s/g, ""));
const isValidExpiryDate = (date: string) =>
  /^(0[1-9]|1[0-2])\/(\d{2})$/.test(date);
const isValidCVV = (cvv: string) => /^\d{3,4}$/.test(cvv);
const isValidName = (name: string) => /^[A-Za-z\s]+$/.test(name.trim());

const CARD_TYPES = [
  {
    label: "Debit card",
    value: "debit",
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

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<{
    label: string;
    value: string;
    icon: ImageSourcePropType;
  } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);

  const isFormComplete =
    !!selectedCard &&
    isValidCardNumber(cardNumber) &&
    isValidName(cardholderName) &&
    isValidExpiryDate(expiryDate) &&
    isValidCVV(cvv);

  const handleSelectCardType = (type: {
    label: string;
    value: string;
    icon: ImageSourcePropType;
  }) => {
    setSelectedCard(type);
    setShowDropdown(false);
  };

  const handleExpiryInput = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, "");
    if (cleaned.length <= 2) setExpiryDate(cleaned);
    else setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
  };

  const handleConfirm = () => {
    if (!isFormComplete) return;
    const newCard = {
      number: cardNumber,
      holder: cardholderName,
      expiry: expiryDate,
      type: selectedCard!,
    };

    if (editingIndex !== null) {
      const copy = [...savedCards];
      copy[editingIndex] = newCard;
      setSavedCards(copy);
    } else {
      setSavedCards([...savedCards, newCard]);
    }

    resetForm();
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete card",
      "Are you sure you want to delete this card?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ]
    );
  };

  const handleDelete = () => {
    if (editingIndex === null) return;
    setSavedCards((cards) => cards.filter((_, i) => i !== editingIndex));
    resetForm();
  };

  const resetForm = () => {
    setCardNumber("");
    setCardholderName("");
    setExpiryDate("");
    setCvv("");
    setSelectedCard(null);
    setShowForm(false);
    setEditingIndex(null);
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

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
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

        {savedCards.map((card, index) => (
          <View key={index} style={styles.cardItem}>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => {
                setCardNumber(card.number);
                setCardholderName(card.holder);
                setExpiryDate(card.expiry);
                setSelectedCard(card.type);
                setEditingIndex(index);
                setShowForm(true);
              }}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M12 20h9"
                  stroke="#FEEDB6"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"
                  stroke="#FEEDB6"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <View style={styles.cardHeader}>
              <Image
                source={require("@/assets/images/payment-cards/chip.png")}
                style={styles.chip}
              />
              <Text style={styles.cardNumber}>{card.number}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Card Holder</Text>
                <Text style={styles.cardValue}>{card.holder}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Expires</Text>
                <Text style={styles.cardValue}>{card.expiry}</Text>
              </View>
            </View>
          </View>
        ))}

        {!showForm ? (
          <TouchableOpacity
            style={styles.cardBox}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.plus}>＋</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Card Type Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown((v) => !v)}
              >
                <Text style={styles.dropdownText}>
                  {selectedCard?.label || "Select a card type"}
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
                      <Image source={type.icon} style={styles.cardIcon} />
                      <Text style={styles.dropdownItemText}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Number, Name, Expiry, CVV */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card number</Text>
              <TextInput
                style={styles.input}
                placeholder="Card number"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={setCardNumber}
              />
              {cardNumber && !isValidCardNumber(cardNumber) && (
                <Text style={styles.errorText}>
                  Card number must be 16 digits
                </Text>
              )}
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
              {cardholderName && !isValidName(cardholderName) && (
                <Text style={styles.errorText}>
                  Only letters and spaces allowed
                </Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiry date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={expiryDate}
                  onChangeText={handleExpiryInput}
                />
                {expiryDate && !isValidExpiryDate(expiryDate) && (
                  <Text style={styles.errorText}>Use MM/YY format</Text>
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  placeholderTextColor="#999"
                  secureTextEntry
                  keyboardType="number-pad"
                  value={cvv}
                  onChangeText={setCvv}
                />
                {cvv && !isValidCVV(cvv) && (
                  <Text style={styles.errorText}>
                    CVV must be 3 or 4 digits
                  </Text>
                )}
              </View>
            </View>

            {/* Delete with confirmation */}
            {editingIndex !== null && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={confirmDelete}
              >
                <TrashIcon width={20} height={20} />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Confirm button fixed */}
      {showForm && (
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isFormComplete && styles.confirmButtonActive,
          ]}
          disabled={!isFormComplete}
          onPress={handleConfirm}
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
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  scrollContainer: {
    paddingTop: 50,
    paddingBottom: 100,
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
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Alice-Regular",
    marginBottom: 20,
  },
  cardBox: {
    backgroundColor: "#1E1E2F",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  plus: { fontSize: 48, color: "#fff" },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: "#000",
  },
  row: { flexDirection: "row" },
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
    padding: 12,
  },
  cardIcon: { width: 24, height: 16, resizeMode: "contain", marginRight: 8 },
  dropdownItemText: { fontFamily: "Alice-Regular", fontSize: 16, flex: 1 },
  errorText: {
    color: "#FF7466",
    fontSize: 12,
    fontFamily: "Alice-Regular",
    marginTop: 4,
  },
  cardItem: {
    backgroundColor: "#1E1E2F",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  editIcon: { position: "absolute", top: 12, right: 12, padding: 6, zIndex: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  chip: { width: 32, height: 24 },
  cardNumber: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
    fontFamily: "Alice-Regular",
  },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  cardLabel: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 24,
    fontFamily: "Alice-Regular",
  },
  cardValue: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Alice-Regular",
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    marginTop: 0,
  },
  deleteText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginLeft: 8,
  },
  confirmButton: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#666",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonActive: { backgroundColor: "#FEEDB6" },
  confirmButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#888",
  },
  confirmButtonTextActive: { color: "#000" },
});
