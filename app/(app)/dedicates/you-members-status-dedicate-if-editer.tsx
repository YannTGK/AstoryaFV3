import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import useAuthStore from "@/lib/store/useAuthStore";

export default function YouMembersStatusDedicate() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [requestSent, setRequestSent] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleRequestPress = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmPopup(false);
    setShowSuccessPopup(true);
  };

  const handleConfirmNo = () => {
    setShowConfirmPopup(false);
  };

  const handleSuccessOk = () => {
    setShowSuccessPopup(false);
    setRequestSent(true);
  };

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

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.title}>Members</Text>

        {/* Profiel */}
        <View style={styles.profileWrapper}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>

        {/* Status */}
        <View style={styles.statusWrapper}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusInput}>
            <Text style={styles.statusText}>Can edit</Text>
          </View>
        </View>

        {/* Request status change */}
        <View style={styles.requestWrapper}>
          <Text style={styles.requestTitle}>Request status change:</Text>
          <Text style={styles.requestText}>
            {!requestSent
              ? "If you’d like to update your status or request a change, please submit a request to the admin."
              : "Your request to update your status has already been submitted. You will be notified as soon as a decision has been made. Thank you for your patience!"}
          </Text>

          <TouchableOpacity
            style={[
              styles.requestButton,
              requestSent && styles.requestButtonDisabled,
            ]}
            disabled={requestSent}
            onPress={handleRequestPress}
          >
            <Text
              style={[
                styles.requestButtonText,
                requestSent && styles.requestButtonTextDisabled,
              ]}
            >
              Admin request
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirm Popup */}
      <Modal transparent visible={showConfirmPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              Are you sure you want to send{"\n"}the request to the admin?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity style={[styles.popupButton, styles.rightBorder]} onPress={handleConfirmNo}>
                <Text style={styles.popupButtonNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupButton} onPress={handleConfirmYes}>
                <Text style={styles.popupButtonYes}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Popup */}
      <Modal transparent visible={showSuccessPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              An request has been sent to the admin.
              You’ll be notified once your request has
              been reviewed and approved.
            </Text>
            <TouchableOpacity style={styles.okButton} onPress={handleSuccessOk}>
              <Text style={styles.okButtonText}>Ok</Text>
            </TouchableOpacity>
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
  profileWrapper: {
    alignItems: "center",
    marginTop: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEEDB6",
    marginBottom: 16,
  },
  name: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 20,
    textAlign: "center",
  },
  username: {
    color: "#ccc",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  statusWrapper: {
    marginTop: 40,
    marginHorizontal: 24,
  },
  statusLabel: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginBottom: 10,
  },
  statusInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
  },
  requestWrapper: {
    marginTop: 25,
    marginHorizontal: 24,
  },
  requestTitle: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginBottom: 10,
  },
  requestText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginBottom: 20,
  },
  requestButton: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  requestButtonDisabled: {
    backgroundColor: "#666",
  },
  requestButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
  },
  requestButtonTextDisabled: {
    color: "#ccc",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  popupBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
  popupButtonNo: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
  popupButtonYes: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
  okButton: {
    marginTop: 10,
    backgroundColor: "#11152A",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  okButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
  },
});
