// screens/CreatedSpace.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import BasicRoomSvg from "@/assets/images/placeHolders/basicRoom.svg";
import TrashIcon from "@/assets/images/svg-icons/delete-white.svg";
import EditIcon from "@/assets/images/svg-icons/edit2.svg";
import api from "@/services/api";

const { width } = Dimensions.get("window");

type Room = { _id: string; name: string };

export default function CreatedSpace() {
  const router = useRouter();
  const { starId, name } = useLocalSearchParams<{ starId: string; name: string }>();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; roomId?: string }>({
    visible: false,
  });

  // bij terugkeer altijd opnieuw laden
  useEffect(() => {
    if (!starId) return;
    setLoading(true);
    api
      .get<Room[]>(`/stars/${starId}/three-d-rooms`)
      .then((res) => setRooms(res.data))
      .catch(() => Alert.alert("Error", "Kon ruimtes niet laden"))
      .finally(() => setLoading(false));
  }, [starId]);

  // Navigeer naar add-content-space met de juiste roomId
  const handleSpaces = (roomId: string) => {
    router.push({
      pathname: "/(app)/my-stars/public-star/space/save-space",
      params: { starId, roomId },
    });
  };

  const confirmDelete = (roomId: string) =>
    setConfirmModal({ visible: true, roomId });

  const handleDelete = async () => {
    if (!starId || !confirmModal.roomId) return;
    try {
      await api.delete(
        `/stars/${starId}/three-d-rooms/detail/${confirmModal.roomId}`
      );
      setRooms((prev) => prev.filter((r) => r._id !== confirmModal.roomId));
      router.push({
      pathname: "/(app)/my-stars/public-star/final-my-star-public",
      params: { starId, name },
    });

    } catch (err: any) {
      Alert.alert("Verwijderen mislukt", err.response?.data?.message || err.message);
    } finally {
      setConfirmModal({ visible: false });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000000", "#273166"]} style={StyleSheet.absoluteFill} />

      {/* Header controls */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode((m) => !m)}>
        {editMode ? (
          <Text style={styles.cancelText}>Cancel</Text>
        ) : (
          <EditIcon width={28} height={28} />
        )}
      </TouchableOpacity>

      <Text style={styles.title}>3D/ VR - space</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {rooms.map((room) => (
          <TouchableOpacity
            key={room._id}
            style={styles.row}
            onPress={() => handleSpaces(room._id)}
          >
<View style={styles.spaceContainer}>
  <View style={styles.frame}>
    <BasicRoomSvg width="100%" height="100%" />
  </View>
  {editMode && (
    <TouchableOpacity
      style={styles.trashOverlay}
      onPress={() => confirmDelete(room._id)}
    >
      <TrashIcon width={24} height={24} />
    </TouchableOpacity>
  )}
  <Text style={styles.label}>{room.name}</Text>
</View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.btn} onPress={() => {/* evt andere actie */}}>
        <Text style={styles.btnTxt}>Change VR Space</Text>
      </TouchableOpacity>

      <Modal transparent visible={confirmModal.visible} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              Weet je zeker dat je deze space wilt verwijderen?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, styles.rightBorder]}
                onPress={() => setConfirmModal({ visible: false })}
              >
                <Text style={styles.popupButtonTextNo}>Nee</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupButton} onPress={handleDelete}>
                <Text style={styles.popupButtonTextYes}>Ja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  editBtn: { position: "absolute", top: 52, right: 20, zIndex: 10 },
  cancelText: { fontFamily: "Alice-Regular", color: "#fff", fontSize: 16 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  list: { paddingTop: 100, paddingHorizontal: 20, paddingBottom: 20 },
  row: {
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 32,
  position: "relative",
},
  spaceContainer: { flex: 1, alignItems:"flex-start" },
  frame: {
  width: width - 40,
  height: 180,
  borderRadius: 12,
  overflow: "hidden",
  marginTop: -35,
  alignSelf: "center",

  },
  label: {
    fontFamily: "Alice-Regular",
    color: "#fff",
    fontSize: 16,
    width: width - 50,
    textAlign: "center",
  },
  btn: {
    position: "absolute",
    backgroundColor: "#FEEDB6",
    bottom: 110,
    width: width - 40,
    marginHorizontal: 20,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnTxt: { fontFamily: "Alice-Regular" },
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
    padding: 24,
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
  popupButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  rightBorder: { borderRightWidth: 1, borderRightColor: "#eee" },
  popupButtonTextNo: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
  popupButtonTextYes: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
  trashOverlay: {
  position: "absolute",
  top: 30,
  alignSelf: "center",
  backgroundColor: "#11152A",
  padding: 12,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#11152A", 
  zIndex: 10,
},
});