import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface SpanProps {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}

const Span: React.FC<SpanProps> = ({ children, color = "#FFFFFF", style }) => {
  return <Text style={[styles.span, { color }, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  span: {
    fontFamily: "Alice-Regular",
    paddingVertical: 4,
    fontSize: 16,
  },
});

export default Span;