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

const { albumName, selected } = useLocalSearchParams();
const selectedPhotos = selected ? JSON.parse(selected as string) : [];

const { width } = Dimensions.get("window");

const currentAlbum = albumName as string;

const albums = [
  { name: "Our memories", count: 7, image: require("@/assets/images/private-star-images/img-1.png") },
  { name: "Summer ‘24", count: 24, image: require("@/assets/images/private-star-images/img-2.png") },
  { name: "Thailand 2016", count: 36, image: require("@/assets/images/private-star-images/img-3.png") },
  { name: "3 of us", count: 28, image: require("@/assets/images/private-star-images/img-4.png") },
  { name: "Empty", count: 0, image: null },
];

export default function PhotoAlbumsScreen() {
  const router = useRouter();

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
      <TouchableOpacity style={styles.editIcon}>
        <Feather name="edit" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Albumgrid */}
      <FlatList
        data={albums}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.albumCard}>
            {item.image ? (
              <Image source={item.image} style={styles.albumImage} />
            ) : (
              <View style={[styles.albumImage, { backgroundColor: "#999", opacity: 0.2 }]} />
            )}
            <Text style={styles.albumTitle}>{item.name}</Text>
            <Text style={styles.albumCount}>{item.count}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Plusknop */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const CARD_SIZE = (width - 60) / 2;

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
    top: 50,
    right: 20,
    zIndex: 10,
  },
  grid: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  albumCard: {
    width: CARD_SIZE,
    marginBottom: 20,
    marginHorizontal: 10,
    alignItems: "center",
  },
  albumImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
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
  fab: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#FEEDB6",
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  fabPlus: {
    fontSize: 36,
    color: "#11152A",
    marginBottom: 2,
  },
});
