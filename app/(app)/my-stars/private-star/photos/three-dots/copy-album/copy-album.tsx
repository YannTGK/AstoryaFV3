import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker"; // ← al nodig!

const { width } = Dimensions.get("window");

const albums = [
  { name: "Our memories", count: 7, image: require("@/assets/images/private-star-images/img-1.png") },
  { name: "Summer ‘24", count: 24, image: require("@/assets/images/private-star-images/img-2.png") },
  { name: "Thailand 2016", count: 36, image: require("@/assets/images/private-star-images/img-3.png") },
  { name: "3 of us", count: 28, image: require("@/assets/images/private-star-images/img-4.png") },
  { name: "Empty", count: 0, image: null },
];

export default function PhotoAlbumsScreen() {
  const router = useRouter();

  const { albumName, selected } = useLocalSearchParams(); // ✅ correct
  const selectedPhotos = selected ? JSON.parse(selected as string) : [];
  const currentAlbum = albumName as string;

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
      console.log("Gekozen afbeelding:", uri);
      // Hier kun je eventueel navigeren of een state updaten
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* Terugknop */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      {/* Titel */}
      <Text style={styles.title}>Photo albums</Text>

      {/* Bewerken-icoon */}
      <TouchableOpacity
  style={styles.editIcon}
  onPress={() => {
    router.push({
      pathname: "/my-stars/private-star/photos/three-dots/copy-album/edit-albums",
      params: {
        selected: JSON.stringify(selectedPhotos), // geef eventueel mee
      },
    });
  }}
>
  <Feather name="edit" size={30} color="#fff" />
</TouchableOpacity>



      {/* Albumgrid */}
      <FlatList
        data={albums}
        keyExtractor={(item) => item.name}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.albumCard}>
            {item.image ? (
              <Image source={item.image} style={styles.albumImage} />
            ) : (
              <View style={[styles.albumImage, { backgroundColor: "#999", opacity: 0.2 }]} />
            )}
            <View style={styles.albumTextWrapper}>
  <Text style={styles.albumTitle}>{item.name}</Text>
  <Text style={styles.albumCount}>{item.count}</Text>
</View>

          </TouchableOpacity>
        )}
      />

      {/* Plusknop */}
      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
  <Text style={styles.plus}>＋</Text>
</TouchableOpacity>

    </View>
  );
}

const CARD_SIZE = (width - 64) / 3;

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
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
    right: 16,
    zIndex: 10,
  },
  grid: {
    paddingTop: 100,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  albumCard: {
    width: CARD_SIZE,
    marginBottom: 20,
    marginHorizontal: 6,
    alignItems: "center",
  },
  albumImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 8,
    marginBottom: 6,
  },
  albumTextWrapper: {
    alignSelf: "flex-start",
    paddingLeft: 4,
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
});