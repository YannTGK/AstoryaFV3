// Move photos to an other album page
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 48) / 3;

export default function PhotoSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [albums, setAlbums] = useState([
    { name: "Our memories", count: 7, image: require("@/assets/images/private-star-images/img-1.png") },
    { name: "Summer ‘24", count: 24, image: require("@/assets/images/private-star-images/img-2.png") },
    { name: "Thailand 2016", count: 36, image: require("@/assets/images/private-star-images/img-3.png") },
    { name: "3 of us", count: 28, image: require("@/assets/images/private-star-images/img-4.png") },
    { name: "Empty", count: 0, image: null },
  ]);

  const toggleSelect = (index: number) => {
    setSelected(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Select Album(s)</Text>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.name}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const isSelected = selected.includes(index);
          return (
            <TouchableOpacity style={styles.albumCard} onPress={() => toggleSelect(index)}>
              {item.image ? (
                <Image
                  source={item.image}
                  style={[
                    styles.albumImage,
                    isSelected && { opacity: 0.4 },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.albumImage,
                    { backgroundColor: "#999", opacity: 0.2 },
                    isSelected && { opacity: 0.4 },
                  ]}
                />
              )}
              <View
                style={[
                  styles.selectCircle,
                  isSelected && styles.selectCircleActive
                ]}
              />
              <Text style={styles.albumTitle}>{item.name}</Text>
              <Text style={styles.albumCount}>
                {item.count} photo{item.count !== 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          );
        }}
        
      />

      {selected.length > 0 && (
        <TouchableOpacity
          style={styles.footerBar}
          onPress={() => router.push({
            pathname: "/my-stars/private-star/photos/created-album",
            params: { selected: JSON.stringify(selected) }
          })}
        >
          <Feather name="folder-minus" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.footerText}>
            Move to {selected.length} album{selected.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  cancelText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    textAlign: "right",
    marginRight: 16,
    marginTop: 32,
  },
  title: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  grid: {
    padding: 16,
    paddingBottom: 120,
  },
  albumCard: {
    width: IMAGE_SIZE,
    margin: 4,
    alignItems: "center",
    position: "relative",
  },
  albumImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    marginBottom: 6,
  },
  selectCircle: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  selectCircleActive: {
    backgroundColor: "#FEEDB6",
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
