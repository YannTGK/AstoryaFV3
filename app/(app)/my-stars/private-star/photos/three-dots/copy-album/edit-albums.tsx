// als je op de "edit" icon klikt, kan je albums selecteren om te verwijderen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 64) / 3;

export default function EditAlbumScreen() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [albums, setAlbums] = useState([
    { name: "Our memories", count: 7, image: require("@/assets/images/private-star-images/img-1.png") },
    { name: "Summer ‘24", count: 24, image: require("@/assets/images/private-star-images/img-2.png") },
    { name: "Thailand 2016", count: 36, image: require("@/assets/images/private-star-images/img-3.png") },
    { name: "3 of us", count: 28, image: require("@/assets/images/private-star-images/img-4.png") },
    { name: "Empty", count: 0, image: null },
  ]);

  const toggleAlbum = (name: string) => {
    setSelectedAlbums((prev) => {
      const updated = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];

      if (updated.length === 0) {
        setEditMode(false);
      }

      return updated;
    });
  };

  const deleteSelected = () => {
    setAlbums((prev) => prev.filter((album) => !selectedAlbums.includes(album.name)));
    setSelectedAlbums([]);
    setShowDeleteModal(false);
    setEditMode(false);
  };

  const allSelected = selectedAlbums.length === albums.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedAlbums([]);
      setEditMode(false); // Automatisch uitzetten
    } else {
      setSelectedAlbums(albums.map((a) => a.name));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Photo albums</Text>

      {!editMode && (
        <TouchableOpacity style={styles.editIcon} onPress={() => setEditMode(true)}>
          <Feather name="edit" size={24} color="#fff" />
        </TouchableOpacity>
      )}

     <View style={[styles.allSelectWrapper, !editMode && { opacity: 0 }]}>
  <TouchableOpacity
    style={styles.selectAllBtn}
    onPress={() => {
      if (allSelected) {
        setSelectedAlbums([]);
        setEditMode(false);
      } else {
        setSelectedAlbums(albums.map((a) => a.name));
      }
    }}
    disabled={!editMode}
  >
    <View
      style={[
        styles.selectAllCircle,
        allSelected && styles.selectAllCircleActive,
      ]}
    />
    <Text style={styles.selectAllText}>All</Text>
  </TouchableOpacity>
</View>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.name}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isSelected = selectedAlbums.includes(item.name);
          return (
            <TouchableOpacity
              style={styles.albumCard}
              onPress={() => editMode && toggleAlbum(item.name)}
              activeOpacity={editMode ? 0.6 : 1}
            >
              {item.image ? (
                <Image source={item.image} style={styles.albumImage} />
              ) : (
                <View style={[styles.albumImage, { backgroundColor: "#999", opacity: 0.2 }]} />
              )}
              {editMode && (
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive,
                  ]}
                />
              )}
              <Text style={styles.albumTitle}>{item.name}</Text>
              <Text style={styles.albumCount}>{item.count}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {editMode && selectedAlbums.length > 0 && (
        <TouchableOpacity style={styles.footerBar} onPress={() => setShowDeleteModal(true)}>
          <Feather name="trash-2" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.footerText}>
            {selectedAlbums.length} album{selectedAlbums.length !== 1 ? "s" : ""} selected
          </Text>
        </TouchableOpacity>
      )}

{!editMode && (
  <View style={styles.plusWrapper}>
    <TouchableOpacity onPress={() => console.log("Add new album")}>
      <PlusIcon width={50} height={50} />
    </TouchableOpacity>
  </View>
)}


      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Are you sure you want to delete these albums?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={styles.modalBtn}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteSelected} style={styles.modalBtn}>
                <Text style={styles.modalDelete}>Delete</Text>
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
    textAlign: "center",
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  editIcon: {
    position: "absolute",
    top: 100,
    right: 20,
    zIndex: 10,
  },
  allSelectWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 28,
    marginHorizontal: 16,
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  selectAllCircleActive: {
    backgroundColor: "#FEEDB6",
  },
  selectAllText: {
    fontFamily: "Alice-Regular",
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
  grid: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  albumCard: {
    width: CARD_SIZE,
    marginBottom: 20,
    marginHorizontal: 6,
    alignItems: "center",
    position: "relative",
  },
  albumImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 8,
    marginBottom: 6,
  },
  albumTitle: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  albumCount: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Alice-Regular",
    opacity: 0.7,
  },
  radioCircle: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  radioCircleActive: {
    backgroundColor: "#FEEDB6",
  },
  footerBar: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    right: 0,
    padding: 20,
  },
  footerText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  modalCancel: {
    color: "#007AFF",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  modalDelete: {
    color: "#FF3B30",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
});
