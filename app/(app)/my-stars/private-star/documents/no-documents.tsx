import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import NoDocumentsIcon from "@/assets/images/svg-icons/no-documents.svg";
import UploadIcon from "@/assets/images/svg-icons/upload-icon.svg";
import { useState } from "react";

export default function NoDocuments() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const handleUploadPress = () => {
    setShowPopup(true);
  };

  const handleConfirm = () => {
    setShowPopup(false);
    router.push("/(app)/my-stars/private-star/documents/documents");
  };

  const handleCancel = () => {
    setShowPopup(false);
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

      {/* Upload button rechtsboven */}
      <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadPress}>
        <UploadIcon width={30} height={30} />
      </TouchableOpacity>

      {/* Titel */}
      <Text style={styles.title}>Documenten</Text>

      {/* Geen documenten - GECENTREERD */}
      <View style={styles.centeredContent}>
        <NoDocumentsIcon width={140} height={140} />
        <Text style={styles.messageText}>No documents found</Text>
      </View>

      {/* Popup */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>Open documents</Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity style={[styles.popupButton, styles.rightBorder]} onPress={handleYes}>
                <Text style={styles.popupButtonTextYes}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupButton} onPress={handleNo}>
                <Text style={styles.popupButtonTextNo}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  function handleYes() {
    handleConfirm();
  }

  function handleNo() {
    handleCancel();
  }
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  uploadBtn: {
    position: "absolute",
    top: 50,
    right: 20,
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
  popupButtonTextNo: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
});
