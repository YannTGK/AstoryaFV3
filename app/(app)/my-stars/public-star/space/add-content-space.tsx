import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import PlusCircle from "@/assets/images/svg-icons/plus-circle.svg";
import PlusSquare from "@/assets/images/svg-icons/plus-square.svg";
import PlusLetter from "@/assets/images/svg-icons/plus-letter.svg";

const { width } = Dimensions.get("window");

export default function AddContentSpace() {
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

      {/* Title */}
      <Text style={styles.title}>3D/VR - space</Text>

      {/* Content list */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.item}>
          <Text style={styles.label}>Photo’s 0/10</Text>
          <PlusSquare width={60} height={60} />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Video’s 0/3</Text>
          <PlusSquare width={60} height={60} />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Audio’s 0/3</Text>
          <PlusCircle width={60} height={60} />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Messages 0/3</Text>
          <PlusLetter width={80} height={80} /> {/* groter */}
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Documents 0/3</Text>
          <PlusSquare width={60} height={60} />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Songs 0/3</Text>
          <PlusCircle width={60} height={60} />
        </View>
      </ScrollView>

      {/* Next button, zelfde positie als Add content */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Next</Text>
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
  scrollContent: {
    paddingTop: 25,
    paddingBottom: 160,
    paddingHorizontal: 20,
  },
  item: {
    marginBottom: 24,
  },
  label: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 100, 
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#FEEDB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
    color: "#000",
  },
});
