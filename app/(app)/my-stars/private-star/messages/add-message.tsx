import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import LetterIcon from "@/assets/images/svg-icons/letter.svg";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import EditIcon from "@/assets/images/svg-icons/edit.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete.svg";
import DownloadIcon from "@/assets/images/svg-icons/download.svg";
import MoreIcon from "@/assets/images/svg-icons/more.svg";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 32;

export default function AddMessage() {
  const router = useRouter();
  const { to } = useLocalSearchParams();

  const [messages, setMessages] = useState<
    { id: number; to: string }[]
  >([]);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (
      to &&
      typeof to === "string" &&
      to.trim() !== "" &&
      !messages.some((msg) => msg.to === to)
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          to,
        },
      ]);
    }
  }, [to]);

  const addNewMessage = () => {
    router.push("/(app)/my-stars/private-star/messages/write-message");
  };

  const renderMessageCard = ({ item }: any) => (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContent}>
        <LetterIcon width={CARD_WIDTH} height={120} style={styles.letterSvg} />
        <Text style={styles.forText}>For: {item.to}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke="#FEEDB6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {/* More-icon rechtsboven */}
      <View style={styles.moreWrapper}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <MoreIcon width={24} height={24} />
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem}>
              <EditIcon width={16} height={16} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <DeleteIcon width={16} height={16} />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <DownloadIcon width={16} height={16} />
              <Text style={styles.menuText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Titel */}
      <Text style={styles.title}>Messages</Text>

      {/* Brieven */}
      <FlatList
        data={messages}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderMessageCard}
      />

      {/* Plus-knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={addNewMessage}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  moreWrapper: {
    position: "absolute",
    top: 110,
    right: 20,
    zIndex: 20,
    alignItems: "flex-end",
  },
  menu: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 21,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuText: {
    fontSize: 13,
    fontFamily: "Alice-Regular",
    color: "#11152A",
  },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    margin: 8,
    alignItems: "center",
  },
  cardContent: {
    position: "relative",
    alignItems: "center",
    width: "100%",
  },
  letterSvg: {
    zIndex: 1,
  },
  forText: {
    fontFamily: "Alice-Regular",
    fontSize: 13,
    color: "#11152A",
    position: "absolute",
    bottom: 10,
    zIndex: 2,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
});
