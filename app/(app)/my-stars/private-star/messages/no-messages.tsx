import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import NoMessageIcon from "@/assets/images/svg-icons/no-message.svg";

export default function NoMessages() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke="#FEEDB6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {/* Titel */}
      <Text style={styles.title}>Messages</Text>

      {/* Geen berichten - GECENTREERD */}
      <View style={styles.centeredContent}>
        <NoMessageIcon width={140} height={140} />
        <Text style={styles.messageText}>No message Found</Text>
      </View>

      {/* Plus-knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={() => router.push("/(app)/my-stars/private-star/messages/write-message")}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
  },
  messageText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginTop: 0,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
});
