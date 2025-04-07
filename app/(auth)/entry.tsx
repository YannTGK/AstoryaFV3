import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import CustomButton from "@/components/ui/Buttons/CustomButton";
import Label from "@/components/ui/Text/Label";
import Span from "@/components/ui/Text/Span";

export default function EntryScreen() {
  const router = useRouter();

  return (
    <View
      style={styles.container}
    >
      {/* Header remains in the center */}
      <View style={styles.header}>
        <View style={styles.logoHolder}>
          <Image
            source={require("@/assets/images/logo/LogoLogin.png")}
          />
          <Text style={styles.logoTitle}>Astorya</Text>
        </View>
        <Text style={styles.alice18}>
          Welcome to Astorya, a place where memories and stories come to life.
          Log in to continue, or sign up to begin your journey.
        </Text>
      </View>

      {/* Buttons remain at the bottom */}
      <View style={styles.buttonHolder}>
        <CustomButton
          title="Sign Up"
          onPress={() => router.push("/(auth)/(register)/register")}
          backgroundColor="#11152A"
          textColor="#fff"
        />
        <CustomButton
          title="Log in"
          onPress={() => router.push("/(auth)/(login)/login")}
          backgroundColor="#FEEDB6"
          textColor="#11152A"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#273166",
    paddingHorizontal: 16, // Ensures even spacing on the sides
  },
  header: {
    flexGrow: 1, // Takes up available space
    justifyContent: "center", // Centers the content vertically
    alignItems: "center",
    width: "100%",
  },
  logoHolder: {
    alignItems: "center",
    gap: 8,
  },
  logoTitle: {
    fontSize: 29,
    fontFamily: "Alice-Regular",
    textAlign: "center",
    color: "#fff",
    marginBottom: 20,
  },
  alice18: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Alice-Regular",
    marginHorizontal: 16,
  },
  buttonHolder: {
    width: "100%",
    alignSelf: "stretch",
    marginBottom: 64, // Gives space at the bottom
  },
});