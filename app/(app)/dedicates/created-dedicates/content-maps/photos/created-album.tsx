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
import { Feather, MaterialIcons, Entypo } from "@expo/vector-icons";

export default function AlbumPage() {
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();
  const { albumName } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
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

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

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
        <Text style={styles.albumTitle}>{albumName || "Album"}</Text>
        <TouchableOpacity style={styles.menuDots} onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.menuDotsText}>⋮</Text>
        </TouchableOpacity>
        {menuOpen && (
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="user-plus" size={16} color="#11152A" />
              <Text style={styles.menuText}>Add people</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="users" size={16} color="#11152A" />
              <Text style={styles.menuText}>See members</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="upload" size={16} color="#11152A" />
              <Text style={styles.menuText}>Uploaden</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="edit" size={16} color="#11152A" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Feather name="download" size={16} color="#11152A" />
              <Text style={styles.menuText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FLATLIST GRID */}
      <FlatList
        data={images}
        keyExtractor={(item, index) => item + index}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => {
          const isFirstInRow = index % 3 === 0;
          return (
            <TouchableOpacity
              onPress={() => {
                setSelectedIndex(index);
                setModalVisible(true);
              }}
            >
              <Image
                source={{ uri: item }}
                style={[
                  styles.gridImage,
                  {
                    marginLeft: isFirstInRow ? 16 : 8,
                    marginRight: 8,
                  },
                ]}
              />
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

      {/* FULLSCREEN ZOOM VIEWER */}
      <Modal visible={modalVisible} transparent={true}>
        <ImageViewer
          imageUrls={imageViewerData}
          index={selectedIndex}
          onCancel={() => setModalVisible(false)}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
        />
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </Modal>

      {/* ADD BUTTON */}
      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>
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
    paddingBottom: 140,
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
  plus: {
    fontSize: 48,
    color: "#11152A",
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
});
