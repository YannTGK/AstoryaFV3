import { Stack } from "expo-router";

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgotPassword" />
      <Stack.Screen name="sendForgotPassword" />
    </Stack>
  );
}