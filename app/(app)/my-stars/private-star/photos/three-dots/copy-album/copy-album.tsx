// import React, { useState } from "react";
// import {
//   View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions
// } from "react-native";
// import { useRouter } from "expo-router";
// import { LinearGradient } from "expo-linear-gradient";
// import { Feather } from "@expo/vector-icons";

// const { width } = Dimensions.get("window");
// const IMAGE_SIZE = (width - 48) / 3;

// const mockImages = [
//   require("@/assets/images/private-star-images/img-1.png"),
//   require("@/assets/images/private-star-images/img-2.png"),
//   require("@/assets/images/private-star-images/img-3.png"),
//   require("@/assets/images/private-star-images/img-4.png"),
// ];

// export default function PhotoSelectScreen() {
//   const router = useRouter();
//   const [selected, setSelected] = useState<number[]>([]);

//   const toggleSelect = (index: number) => {
//     setSelected(prev =>
//       prev.includes(index)
//         ? prev.filter(i => i !== index)
//         : [...prev, index]
//     );
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

//       <Text style={styles.title}>Select photo(s)</Text>

//       <FlatList
//         data={mockImages}
//         keyExtractor={(item, index) => index.toString()}
//         numColumns={3}
//         contentContainerStyle={styles.grid}
//         renderItem={({ item, index }) => {
//           const isSelected = selected.includes(index);
//           return (
//             <TouchableOpacity onPress={() => toggleSelect(index)}>
//               <Image source={item} style={[styles.image, isSelected && { opacity: 0.5 }]} />
//               {isSelected && <View style={styles.checkmark} />}
//             </TouchableOpacity>
//           );
//         }}
//       />

//       {selected.length > 0 && (
//         <TouchableOpacity
//           style={styles.footerBar}
//           onPress={() => router.push({
//             pathname: "/my-stars/private-star/photos/three-dots/copy-album/selected-album",
//             params: { selected: JSON.stringify(selected) }
//           })}
//         >
//           <Feather name="copy" size={20} color="#fff" style={{ marginRight: 10 }} />
//           <Text style={styles.footerText}>Copy to {selected.length} photo{selected.length !== 1 ? "'s" : ""}</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     textAlign: "center",
//     marginTop: 50,
//     fontSize: 20,
//     color: "#fff",
//     fontFamily: "Alice-Regular",
//   },
//   grid: {
//     padding: 16,
//     paddingBottom: 120,
//   },
//   image: {
//     width: IMAGE_SIZE,
//     height: IMAGE_SIZE,
//     margin: 4,
//     borderRadius: 8,
//   },
//   checkmark: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: "#FEEDB6",
//     borderWidth: 1,
//     borderColor: "#fff",
//   },
//   footerBar: {
//     position: "absolute",
//     bottom: 80,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     left: 0,
//     right: 0,
//     padding: 20,
//   },
//   footerText: {
//     color: "#fff",
//     fontFamily: "Alice-Regular",
//     fontSize: 16,
//   },
// });
