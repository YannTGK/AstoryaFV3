import { Stack } from "expo-router";

export default function DedicateLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dedicate" />
    </Stack>
  );
}