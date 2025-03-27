import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensure first render happens before navigation
  }, []);

  useEffect(() => {
    if (isMounted) {
      router.replace("/(auth)/entry"); // Navigate only after first render
    }
  }, [isMounted]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}