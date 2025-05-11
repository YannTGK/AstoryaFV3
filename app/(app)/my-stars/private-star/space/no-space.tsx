import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PlusIcon from "@/assets/images/svg-icons/plus.svg";

export default function NoVRSpace() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [spaceName, setSpaceName] = useState("");

  const handleCreatePress = () => {
    setShowPopup(true);
  };

  const handleConfirm = () => {
    if (!spaceName.trim()) return;
    setShowPopup(false);

    const encoded = encodeURIComponent(spaceName.trim());

    router.push({
      pathname: "/(app)/my-stars/private-star/space/chose-vr-space",
      params: { name: encoded },
    });
  };

  const handleCancel = () => {
    setShowPopup(false);
    setSpaceName("");
  };

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
      <Text style={styles.title}>3D/VR - space</Text>

      {/* Lege toestand */}
      <View style={styles.centeredContent}>
        <Text style={styles.messageText}>
          No 3D/VR-spaces created yet.{"\n"}Create your first VR-space!
        </Text>
      </View>

      {/* Plus-knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={handleCreatePress}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* Popup */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>Create 3D/VR - space</Text>

            <TextInput
              value={spaceName}
              onChangeText={setSpaceName}
              placeholder="e.g. To my daughter"
              placeholderTextColor="#999"
              style={styles.input}
            />

            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, styles.rightBorder]}
                onPress={handleCancel}
              >
                <Text style={styles.popupButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={handleConfirm}
              >
                <Text style={styles.popupButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
