import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface LabelProps {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}

const Label: React.FC<LabelProps> = ({ children, color = "#ffffff", style }) => {
  return <Text style={[styles.label, { color }, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontFamily: "Alice-Regular",
    paddingVertical: 4,
  },
});

export default Label;