import React from "react";
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor: string;
  textColor: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, backgroundColor, textColor }) => {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <Text style={[styles.buttonText, { color: textColor, fontFamily: "Alice-Regular" }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
  },
});

export default CustomButton;