import { Stack } from "expo-router";

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="public" />
      <Stack.Screen name="private" />
      <Stack.Screen name="search-public" />
      <Stack.Screen name="search-private" />
    </Stack>
  );
}