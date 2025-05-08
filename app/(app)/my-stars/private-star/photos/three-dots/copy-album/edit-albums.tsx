import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions,
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

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Photo albums</Text>

      {/* All knop rechtsboven */}
      <Text style={styles.allText}>All</Text>

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

      {/* Footer */}
      <TouchableOpacity
  style={styles.footerBar}
  onPress={() => {
    setAlbums((prev) => prev.filter((a) => !selectedAlbums.includes(a.name)));
    setSelectedAlbums([]); // reset selectie
  }}
>
  <Feather name="trash-2" size={20} color="#fff" style={{ marginRight: 10 }} />
  <Text style={styles.footerText}>
    {selectedAlbums.length} photo{selectedAlbums.length !== 1 ? "’s" : ""} selected
  </Text>
</TouchableOpacity>

</View> // ← deze miste je!

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
  allText: {
    position: "absolute",
    top: 100,
    right: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
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
});
