import React from "react";
import { TouchableOpacity, Image, StyleSheet, ViewStyle, ImageStyle } from "react-native";
import { useRouter } from "expo-router";

// Eventueel: pas 'Props' aan naar jouw wens, bijv. met specifieke style-props
type Props = {
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
};

export default function BackButton({ containerStyle, imageStyle }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()} style={containerStyle}>
      <Image
        style={[styles.defaultImage, imageStyle]}
        source={require("@/assets/images/icons/back.svg")}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  defaultImage: {
    width: 36,
    height: 36,
    marginTop: 16
  },
});