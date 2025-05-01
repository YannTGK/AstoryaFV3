import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import PlusIcon from "@/assets/images/svg-icons/plus3.svg"; // ✅ zelfde als dedicate.tsx
import NoMembersIcon from "@/assets/images/svg-icons/no-members.svg";

export default function NoMembersDedicate() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Hele pagina aanklikbaar behalve plus */}
      <Pressable style={{ flex: 1 }} onPress={() => router.push("/dedicates/see-members-dedicate")}>
        
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
        <Text style={styles.title}>Members</Text>

        {/* Geen members - Gecentreerd */}
        <View style={styles.centeredContent}>
          <NoMembersIcon width={140} height={140} />
          <Text style={styles.messageText}>No members found</Text>
        </View>

      </Pressable>

      {/* Plus knop */}
      <TouchableOpacity style={styles.plusBtn} onPress={() => router.push("/dedicates/created-dedicates/add-people/add-members-dedicate")}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

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
    marginTop: 10,
  },
  plusBtn: {
    position: "absolute",
    top: 85,
    right: 24,
    zIndex: 10,
  },
});
