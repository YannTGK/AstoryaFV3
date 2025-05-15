// foto album (empty state) --> eerste pagina als je op "photos" klikt
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { TextInput } from "react-native";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import NoVideoIcon from "@/assets/images/svg-icons/no-album.svg";

export default function PhotosPage() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [albumName, setAlbumName] = useState("");

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Video albums</Text>

      <View style={styles.centered}>
        {/* Vervang dit met je eigen icoon later */}
  <NoVideoIcon width={130} height={130} />

        <Text style={styles.noAlbumText}>No video albums found</Text>
      </View>

      {/* Plus-knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Album</Text>

            <TextInput
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="Album Name"
              placeholderTextColor="#999"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.buttonDivider} />
              <TouchableOpacity
                onPress={() => {
                  if (!albumName.trim()) return; // alleen doorgaan als er iets is ingevuld

                  // stel dat je albums opslaat of doorgeeft via params:
                  const encodedName = encodeURIComponent(albumName.trim());

                  setShowModal(false);
                  router.push({
                    pathname: "/my-stars/private-star/videos/created-video-album",
                    params: { albumName: encodedName },
                  });
                }}
              >
                <Text style={styles.modalCreate}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { 
    position: "absolute", 
    top: 50, 
    left: 20, 
    zIndex: 10 
  },
  backText: { 
    color: "#FEEDB6", 
    fontSize: 20 
  },
  title: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  noAlbumText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular" },
  addButton: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    backgroundColor: "#FEEDB6",
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // 👈 toevoegen
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100,
  },
  modalBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#11152A",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#11152A",
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: "#11152A",
    paddingBottom: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    borderTopColor: "#ccc", // lijn boven cancel/create
  },
  modalCancel: {
    fontSize: 18,
    fontFamily: "Alice-Regular",
    color: "#007AFF",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  modalCreate: {
    fontSize: 18,
    fontFamily: "Alice-Regular",
    color: "#007AFF",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonDivider: {
    width: 1,
    backgroundColor: "#ccc",
    height: "100%",
  },
});
