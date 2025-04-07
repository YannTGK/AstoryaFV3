import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import useAuthStore from "@/lib/store/useAuthStore";

export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated, loadToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    "Alice-Regular": require("@/assets/fonts/Alice-Regular.ttf"),
  });

  useEffect(() => {
    const check = async () => {
      await loadToken(); // check auth from AsyncStorage
      setIsLoading(false);
    };
    check();
  }, []);

  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      if (isAuthenticated) {
        router.replace("/explores/public");
      } else {
        router.replace("/(auth)/entry");
      }
    }
  }, [isAuthenticated, fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#273166" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}