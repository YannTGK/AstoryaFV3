import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 64) / 3;

export default function SelectAlbumScreen() {
  const router = useRouter();
  const { selected } = useLocalSearchParams();
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [albums, setAlbums] = useState([
    { name: "Our memories", count: 7, image: require("@/assets/images/private-star-images/img-1.png") },
    { name: "Summer ‘24", count: 24, image: require("@/assets/images/private-star-images/img-2.png") },
    { name: "Thailand 2016", count: 36, image: require("@/assets/images/private-star-images/img-3.png") },
    { name: "3 of us", count: 28, image: require("@/assets/images/private-star-images/img-4.png") },
    { name: "Empty", count: 0, image: null },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* Terugknop */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Photo albums</Text>

      <View style={styles.allSelectWrapper}>
        <TouchableOpacity
          style={styles.selectAllBtn}
          onPress={() => {
            const allAlbumNames = albums.map((a) => a.name);
            const allSelected = allAlbumNames.every((name) => selectedAlbums.includes(name));
            setSelectedAlbums(allSelected ? [] : allAlbumNames);
          }}
        >
          <View
            style={[
              styles.selectAllCircle,
              albums.every((a) => selectedAlbums.includes(a.name)) && styles.selectAllCircleActive,
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
              onPress={() => {
                setSelectedAlbums((prev) =>
                  prev.includes(item.name)
                    ? prev.filter((name) => name !== item.name)
                    : [...prev, item.name]
                );
              }}
            >
              {item.image ? (
                <Image source={item.image} style={styles.albumImage} />
              ) : (
                <View style={[styles.albumImage, { backgroundColor: "#999", opacity: 0.2 }]} />
              )}
              <View
                style={[
                  styles.radioCircle,
                  isSelected && styles.radioCircleActive,
                ]}
              />
              <Text style={styles.albumTitle}>{item.name}</Text>
              <Text style={styles.albumCount}>{item.count}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Footerbalk alleen als er selectie is */}
      {selectedAlbums.length > 0 && (
        <TouchableOpacity
          style={styles.footerBar}
          onPress={() => setConfirmVisible(true)}
        >
          <Feather name="copy" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.footerText}>
            Copy to {selectedAlbums.length} album{selectedAlbums.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {/* Bevestigingspopup */}
      {confirmVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Copy to {selectedAlbums.length} album{selectedAlbums.length !== 1 ? "s" : "}"}?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setConfirmVisible(false)} style={styles.modalBtn}>
                <Text style={[styles.modalBtnText, { color: "#007AFF" }]}>No</Text>
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity
                onPress={() => {
                  if (selectedAlbums.length === 0) {
                    Alert.alert("No albums selected", "Please select at least one album to continue.");
                    setConfirmVisible(false);
                    return;
                  }

                  const photosToCopy = JSON.parse(selected as string);

                  const updatedAlbums = albums.map((album) =>
                    selectedAlbums.includes(album.name)
                      ? { ...album, count: album.count + photosToCopy.length }
                      : album
                  );

                  setAlbums(updatedAlbums);
                  setSelectedAlbums([]);
                  setConfirmVisible(false);

                  router.push({
                    pathname: "/my-stars/private-star/photos/three-dots/copy-album/edit-albums",
                    params: {
                      selected: selected,
                      targetAlbums: JSON.stringify(selectedAlbums),
                    },
                  });
                }}
                style={styles.modalBtn}
              >
                <Text style={[styles.modalBtnText, { color: "#007AFF" }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  grid: {
    paddingTop: 32,
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
    backgroundColor: "transparent",
  },
  footerText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 100,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: 280,
    alignItems: "center",
  },
  modalText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  modalBtnText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  modalDivider: {
    width: 1,
    backgroundColor: "#ccc",
  },
  allSelectWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
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
    fontSize: 14,
    marginLeft: 10,
  },
});
