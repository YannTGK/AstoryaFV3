import React from "react";
import InputField from "./Input";


interface DateOfBirthInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

const formatDate = (input: string) => {
  // Remove non-numeric characters
  const cleaned = input.replace(/\D/g, "");

  // Formats: DD/MM/YYYY
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({ value, onChangeText, error }) => {
  return (
    <InputField
      label="Date of Birth"
      placeholder="DD/MM/YYYY"
      keyboardType="numeric"
      value={value}
      onChangeText={(text) => onChangeText(formatDate(text))}
    />
  );
};

export default DateOfBirthInput;