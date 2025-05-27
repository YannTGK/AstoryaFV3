// screens/NoVRSpace.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";

export default function NoVRSpace() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId?: string }>();
  const [showPopup, setShowPopup] = useState(false);
  const [spaceName, setSpaceName] = useState("");

  const handleConfirm = () => {
    const trimmed = spaceName.trim();
    if (!trimmed) return;
    if (!starId) {
      Alert.alert("Error", "Geen ster-ID bekend");
      return;
    }
    setShowPopup(false);
    router.push({
      pathname: "/(app)/my-stars/public-star/space/chose-vr-space",
      params: {
        starId,
        name: encodeURIComponent(trimmed),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>3D/VR – space</Text>
      <View style={styles.centeredContent}>
        <Text style={styles.messageText}>
          No 3D/VR-space created yet.{"\n"}Create your public VR-space!
        </Text>
      </View>
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={() => setShowPopup(true)}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>Name your 3D/VR-space</Text>
            <TextInput
              value={spaceName}
              onChangeText={setSpaceName}
              placeholder="Enter a name"
              placeholderTextColor="#999"
              style={styles.input}
            />
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, styles.rightBorder]}
                onPress={() => {
                  setShowPopup(false);
                  setSpaceName("");
                }}
              >
                <Text style={styles.popupButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={handleConfirm}
              >
                <Text style={styles.popupButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
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
    paddingHorizontal: 40,
  },
  messageText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  popupBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  popupTitle: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#11152A",
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    paddingBottom: 4,
    marginBottom: 20,
    textAlign: "center",
  },
  popupButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  popupButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  popupButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
});