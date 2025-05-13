import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import ImageViewer from "react-native-image-zoom-viewer";
import { Feather } from "@expo/vector-icons";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";

export default function AlbumPage() {
  const router = useRouter();
  const { albumName } = useLocalSearchParams();
  const currentAlbum = albumName as string;

  const [images, setImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [showMoveButton, setShowMoveButton] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImages((prev) => [...prev, uri]);
    }
  };

  const imageViewerData = images.map((uri) => ({ url: uri }));

  const handlePhotoPress = (item: string, index: number) => {
    if (isDeleteMode) {
      setSelectedPhotos((prev) =>
        prev.includes(item)
          ? prev.filter((uri) => uri !== item)
          : [...prev, item]
      );
    } else {
      setSelectedIndex(index);
      setModalVisible(true);
    }
  };

  const handleDelete = () => {
    setImages(images.filter((img) => !selectedPhotos.includes(img)));
    setSelectedPhotos([]);
    setIsDeleteMode(false);
    setConfirmDeleteVisible(false);
  };

  const handleCopyOrMove = (type: "copy" | "move") => {
    router.push({
      pathname:
        type === "copy"
          ? "/my-stars/private-star/photos/three-dots/copy-album/selected-album"
          : "/my-stars/private-star/photos/three-dots/move-album/move-album",
      params: {
        albumName: encodeURIComponent(currentAlbum),
        selected: JSON.stringify(selectedPhotos),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Svg width={24} height={24}>
              <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photo’s</Text>
        </View>

        <View style={styles.albumTitleRow}>
          <Text style={styles.albumTitle}>{albumName}</Text>
          {isDeleteMode && (
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() =>
                setSelectedPhotos(selectedPhotos.length === images.length ? [] : images)
              }
            >
              <View
                style={[
                  styles.selectAllCircle,
                  selectedPhotos.length === images.length && styles.selectAllCircleActive,
                ]}
              />
              <Text style={styles.selectAllText}>All</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isDeleteMode && (
          <TouchableOpacity style={styles.menuDots} onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={styles.menuDotsText}>⋮</Text>
          </TouchableOpacity>
        )}

        {menuOpen && (
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/add-people/AddPeoplePage")}
            >
              <Feather name="user-plus" size={16} color="#11152A" />
              <Text style={styles.menuText}>Add people</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/see-members/SeeMembersPhoto")}
            >
              <Feather name="users" size={16} color="#11152A" />
              <Text style={styles.menuText}>See members</Text>
            </TouchableOpacity>

            {["Delete", "Copy to album", "Move to album"].map((action, idx) => (
              <TouchableOpacity
                key={action}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  setIsDeleteMode(true);
                  setSelectedPhotos([]);
                  setShowCopyButton(action === "Copy to album");
                  setShowMoveButton(action === "Move to album");
                }}
              >
                <Feather name={["trash-2", "copy", "folder-minus"][idx] as any} size={16} color="#11152A" />
                <Text style={styles.menuText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* GRID */}
      <FlatList
        data={images}
        keyExtractor={(item, index) => item + index}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => {
          const isFirstInRow = index % 3 === 0;
          const isSelected = selectedPhotos.includes(item);

          return (
            <TouchableOpacity onPress={() => handlePhotoPress(item, index)}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: item }}
                  style={[
                    styles.gridImage,
                    {
                      marginLeft: isFirstInRow ? 16 : 8,
                      marginRight: 8,
                      opacity: isDeleteMode && !isSelected ? 0.6 : 1,
                    },
                  ]}
                />
                {isDeleteMode && (
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 12,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: "#fff",
                      backgroundColor: isSelected ? "#FEEDB6" : "transparent",
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateWrapper}>
            <Image
              source={require("@/assets/images/icons/no-pictures.png")}
              style={{ width: 130, height: 130 }}
            />
            <Text style={styles.noMemoriesText}>
              Every story starts with a moment.{"\n"}Upload your first memory now.
            </Text>
          </View>
        }
      />

      {/* FOOTER ACTION BARS */}
      {isDeleteMode && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.deleteBar} onPress={() => setConfirmDeleteVisible(true)}>
          <View style={styles.deleteBarBtn}>
            <Feather name="trash-2" size={20} color="#fff" />
            <Text style={styles.deleteBarText}>
              {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "’s" : ""} selected
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {showCopyButton && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.deleteBar} onPress={() => handleCopyOrMove("copy")}>
          <View style={styles.deleteBarBtn}>
            <Feather name="copy" size={20} color="#fff" />
            <Text style={styles.deleteBarText}>
              Copy {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "'s" : ""} to album
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {showMoveButton && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.deleteBar} onPress={() => handleCopyOrMove("move")}>
          <View style={styles.deleteBarBtn}>
            <Feather name="folder-minus" size={20} color="#fff" />
            <Text style={styles.deleteBarText}>
              Move {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "'s" : ""} to album
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* IMAGE MODAL */}
      <Modal visible={modalVisible} transparent={true}>
        <ImageViewer
          imageUrls={imageViewerData}
          index={selectedIndex}
          onCancel={() => setModalVisible(false)}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </Modal>

      {/* ADD BUTTON */}
       <View style={styles.plusWrapper}>
<TouchableOpacity onPress={pickImage}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* CONFIRM DELETE MODAL */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Are you sure you want to remove the image?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={styles.confirmBtn}>
                <Text style={[styles.confirmBtnText, { color: "#007AFF" }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.confirmBtn}>
                <Text style={[styles.confirmBtnText, { color: "#007AFF" }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 50,
    marginBottom: 20,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  menuDots: {
    position: "absolute",
    right: 16,
    top: 72,
  },
  menuDotsText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 28,
  },
  albumTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 32,
    flex: 1, // belangrijk voor centrering
  },
  albumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginHorizontal: 20,
    position: "relative",
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 0,
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
  menuBox: {
    position: "absolute",
    top: 105,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 999,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  menuText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
  },
  gridContainer: {
    paddingBottom: 180,
    paddingTop: 32,
  },
  gridImage: {
    width: 109,
    height: 109,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyStateWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  noMemoriesText: {
    marginTop: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
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
    zIndex: 20,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 72,
    right: 20,
    zIndex: 101,
  },
  closeText: {
    color: "#fff",
    fontSize: 32,
  },
  deleteBar: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "#11152A",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#2D2D2D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 20,
  },
  deleteBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deleteBarText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  confirmOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
},
confirmBox: {
  backgroundColor: "#fff",
  borderRadius: 16,
  paddingVertical: 20,
  paddingHorizontal: 20,
  width: 280,
  alignItems: "center",
},
confirmText: {
  fontFamily: "Alice-Regular",
  fontSize: 16,
  textAlign: "center",
  color: "#11152A",
  marginBottom: 20,
},
confirmButtons: {
  flexDirection: "row",
  borderTopWidth: 1,
  borderColor: "#ccc",
  width: "100%",
},
confirmBtn: {
  flex: 1,
  alignItems: "center",
  paddingVertical: 12,
  borderRightWidth: 0.5,
  borderColor: "#ccc",
},
confirmBtnText: {
  fontFamily: "Alice-Regular",
  fontSize: 16,
},

  
});