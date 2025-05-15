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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import type { ImageSourcePropType } from "react-native";

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
    selectedCard &&
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
    let cleaned = text.replace(/[^\d]/g, "");
    if (cleaned.length === 0) {
      setExpiryDate("");
    } else if (cleaned.length <= 2) {
      setExpiryDate(cleaned);
    } else {
      const month = cleaned.slice(0, 2);
      const year = cleaned.slice(2, 4);
      setExpiryDate(`${month}/${year}`);
    }
  };

  const handleConfirm = () => {
    if (!isFormComplete) return;
    const newCard = {
      number: cardNumber,
      holder: cardholderName,
      expiry: expiryDate,
      type: selectedCard,
    };
    if (editingIndex !== null) {
      const updated = [...savedCards];
      updated[editingIndex] = newCard;
      setSavedCards(updated);
    } else {
      setSavedCards([...savedCards, newCard]);
    }

    setCardNumber("");
    setCardholderName("");
    setExpiryDate("");
    setCvv("");
    setSelectedCard(null);
    setShowForm(false);
    setEditingIndex(null); // resetten
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

        {savedCards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardItem}
            onPress={() => {
              const card = savedCards[index];
              setCardNumber(card.number);
              setCardholderName(card.holder);
              setExpiryDate(card.expiry);
              setSelectedCard(card.type);
              setEditingIndex(index);
              setShowForm(true);
            }}
          >
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
          </TouchableOpacity>
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
            {/* Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown(!showDropdown)}
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
                      <View style={styles.dropdownItemContent}>
                        <Image source={type.icon} style={styles.cardIcon} />
                        <Text style={styles.dropdownItemText}>
                          {type.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Card number */}
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
              {cardNumber.length > 0 && !isValidCardNumber(cardNumber) && (
                <Text style={styles.errorText}>
                  Card number must be 16 digits
                </Text>
              )}
            </View>

            {/* Cardholder name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder name</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardholder name"
                placeholderTextColor="#999"
                value={cardholderName}
                onChangeText={setCardholderName}
              />
              {cardholderName.length > 0 && !isValidName(cardholderName) && (
                <Text style={styles.errorText}>
                  Only letters and spaces allowed
                </Text>
              )}
            </View>

            {/* Expiry & CVV */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiry date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  value={expiryDate}
                  onChangeText={handleExpiryInput}
                  keyboardType="number-pad"
                />
                {expiryDate.length > 0 && !isValidExpiryDate(expiryDate) && (
                  <Text style={styles.errorText}>Use MM/YY format</Text>
                )}
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
                {cvv.length > 0 && !isValidCVV(cvv) && (
                  <Text style={styles.errorText}>
                    CVV must be 3 or 4 digits
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isFormComplete && styles.confirmButtonActive,
                savedCards.length > 0
                  ? styles.confirmButtonCompact
                  : styles.confirmButtonInitial,
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
    paddingTop: 50,
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
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginTop: 16,
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
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: "auto", // <-- ruimte onderaan zodat hij niet verdwijnt
  },

  confirmButtonInitial: {
    marginTop: 210, // grote ruimte als er nog geen kaarten zijn
  },

  confirmButtonCompact: {
    marginTop: 60, // compactere ruimte als er al kaarten zijn
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  chip: {
    width: 32,
    height: 24,
  },

  cardNumber: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
    fontFamily: "Alice-Regular",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
});
