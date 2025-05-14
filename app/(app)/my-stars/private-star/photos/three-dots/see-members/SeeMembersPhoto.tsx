// eerste pagina als je op "see members" klikt
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import PlusIcon from "@/assets/images/svg-icons/plus3.svg";

// dit is een voorbeeld van mensen, moet veranderd worden adhv de backend
const members = [
  { name: "You" },
  { name: "@Elisabeth_251" },
  { name: "@AnnieJohn" },
  { name: "@William_Rodri" },
];

export default function SeeMembersDedicate() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back button */}
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

      {/* Plus knop */}
      <TouchableOpacity style={styles.plusBtn} onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/add-people/AddMorePeople")}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      {/* Members lijst */}
      <ScrollView style={styles.listWrapper} contentContainerStyle={{ paddingBottom: 100 }}>
  {members.map((member, idx) => (
    <View key={idx} style={styles.memberItem}>
      <View style={styles.avatar} />
      <Text style={styles.memberName}>{member.name}</Text>
    </View>
  ))}
</ScrollView>

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
  plusBtn: {
    position: "absolute",
    top: 95,
    right: 16,
    zIndex: 20,
  },
  listWrapper: {
    marginTop: 88,
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: "#999",
  },
  memberName: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
  },
});
