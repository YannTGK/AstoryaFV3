import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function MyStarScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>My Star Screen</Text>
    </View>
  );
}