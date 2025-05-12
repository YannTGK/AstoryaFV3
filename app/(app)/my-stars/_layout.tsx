import { Stack } from "expo-router";
import { AudioProvider } from "@/app/(app)/my-stars/private-star/audios/audioProvider"; // pad aanpassen indien nodig


export default function MyStarLayout() {
  return (
        <AudioProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="start-my-star-public" />
    </Stack>
        </AudioProvider>
  );
}