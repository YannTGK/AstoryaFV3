import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import useAuthStore from "@/lib/store/useAuthStore";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/explores/public");
    } else {
      router.replace("/(auth)/entry");
    }
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}