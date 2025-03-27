import React from "react";
import InputField from "./Input";

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

const formatPhoneNumber = (input: string) => {
  // Remove non-numeric characters
  const cleaned = input.replace(/\D/g, "");

  // Ensure it starts with +32 (Belgium country code)
  if (cleaned.startsWith("32")) {
    input = "+" + cleaned;
  } else if (cleaned.startsWith("0")) {
    input = "+32" + cleaned.slice(1);
  } else if (!cleaned.startsWith("+32")) {
    input = "+32" + cleaned;
  }

  // Format: (+32) 494 73 91 57
  if (input.length <= 4) return input;
  if (input.length <= 7) return `(${input.slice(0, 3)}) ${input.slice(3)}`;
  if (input.length <= 10) return `(${input.slice(0, 3)}) ${input.slice(3, 6)} ${input.slice(6)}`;
  return `(${input.slice(0, 3)}) ${input.slice(3, 6)} ${input.slice(6, 8)} ${input.slice(8, 10)}`;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChangeText, error }) => {
  return (
    <InputField
      label="Phone Number"
      placeholder="(+32) 494 33 91 23"
      keyboardType="phone-pad"
      value={value}
      onChangeText={(text) => onChangeText(formatPhoneNumber(text))}
    />
  );
};

export default PhoneNumberInput;