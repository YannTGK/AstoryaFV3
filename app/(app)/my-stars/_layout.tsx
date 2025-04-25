import { Stack } from "expo-router";

export default function MyStarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="start-my-star-public" />
    </Stack>
  );
}