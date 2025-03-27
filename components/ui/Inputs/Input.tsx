import React from "react";
import { View, TextInput, KeyboardTypeOptions, StyleSheet } from "react-native";
import Label from "../Text/Label";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  onChangeText: (text: string) => void;
  value: string;
  secureTextEntry?: boolean;
}

const formatPhoneNumber = (input: string): string => {
  let cleaned = input.replace(/\D/g, ""); // Verwijder niet-numerieke tekens

  // **Zorg dat het begint met +32**
  if (cleaned.startsWith("32")) {
    cleaned = "+32" + cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    cleaned = "+32" + cleaned.slice(1);
  } else if (!cleaned.startsWith("+32")) {
    cleaned = "+32" + cleaned;
  }

  // **Formateren van het Belgische nummer**
  let localNumber = cleaned.replace("+32", "").trim();

  if (localNumber.startsWith("4")) {
    // 📱 Mobiele nummers: +32 494 73 91 57
    return `+32 ${localNumber.slice(0, 2)} ${localNumber.slice(2, 4)} ${localNumber.slice(4, 6)} ${localNumber.slice(6)}`;
  } else {
    // ☎ Vaste nummers: +32 2 345 67 89
    return `+32 ${localNumber.slice(0, 1)} ${localNumber.slice(1, 4)} ${localNumber.slice(4, 6)} ${localNumber.slice(6)}`;
  }
};

const formatDate = (input: string): string => {
  // Verwijder niet-numerieke tekens
  const cleaned = input.replace(/\D/g, "");

  // Formatteer als DD/MM/YYYY
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder = "",
  keyboardType = "default",
  autoCapitalize = "none",
  onChangeText,
  value,
  secureTextEntry = false,
}) => {
  const handleChangeText = (text: string) => {
    if (keyboardType === "phone-pad") {
      onChangeText(formatPhoneNumber(text));
    } else if (keyboardType === "numeric") {
      onChangeText(formatDate(text));
    } else {
      onChangeText(text);
    }
  };

  return (
    <View>
      <Label>{label}</Label>
      <TextInput
        style={styles.input}
        onChangeText={handleChangeText}
        value={value}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        maxLength={keyboardType === "phone-pad" ? 16 : keyboardType === "numeric" ? 10 : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default InputField;