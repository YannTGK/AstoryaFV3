import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import TrashIcon from "@/assets/images/svg-icons/delete-white.svg";
import EditIcon from "@/assets/images/svg-icons/edit2.svg";

const { width } = Dimensions.get("window");

export default function SaveSpace() {
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166"]}
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

      {/* Edit button or Cancel */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => setEditMode((prev) => !prev)}
      >
        {editMode ? (
          <Text style={styles.cancelText}>Cancel</Text>
        ) : (
          <EditIcon width={28} height={28} />
        )}
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>3D/VR - space</Text>

      {/* VR Frame */}
      <View style={styles.frame}>
        {editMode ? (
          <TouchableOpacity onPress={() => setShowDeletePopup(true)}>
            <TrashIcon width={32} height={32} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.label}>xx</Text>

      {/* Buttons (exacte positie uit save-space) */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.darkButton}
          onPress={() => router.push("/(app)/my-stars/public-star/final-my-star-public")}
        >
          <Text style={styles.darkButtonText}>Return to my star</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.lightButton}
          onPress={() => {}}
        >
          <Text style={styles.lightButtonText}>Change VR - space</Text>
        </TouchableOpacity>
      </View>

      {/* Delete popup */}
      <Modal transparent visible={showDeletePopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              Are you sure you want to remove the 3D/VR - space?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, styles.rightBorder]}
                onPress={() => setShowDeletePopup(false)}
              >
                <Text style={styles.popupButtonTextYes}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={() => {
                  setShowDeletePopup(false);
                  router.push("/(app)/my-stars/public-star/space/no-space");
                }}
              >
                <Text style={styles.popupButtonTextYes}>Yes</Text>
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
  editBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
  },
  cancelText: {
    fontFamily: "Alice-Regular",
    color: "#fff",
    fontSize: 16,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  frame: {
    height: 180,
    width: width - 40,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    marginTop: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: "Alice-Regular",
    color: "#fff",
    fontSize: 14,
    marginLeft: 20,
    marginTop: 10,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  darkButton: {
    backgroundColor: "#11152A",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  darkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
  lightButton: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  lightButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
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
  popupText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
    marginBottom: 24,
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
  popupButtonTextYes: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
});
