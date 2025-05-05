import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
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
import CloseIcon from "@/assets/images/svg-icons/close-icon.svg";
import AddPeopleIcon from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";

import { useMessageStore } from "@/lib/store/useMessageStore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 32;

export default function AddMessage() {
  const router = useRouter();
  const { to, from, message } = useLocalSearchParams();
  const { messages, addMessage } = useMessageStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [popupMenuOpen, setPopupMenuOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState<any | null>(null);

  useEffect(() => {
    if (
      to &&
      from &&
      message &&
      typeof to === "string" &&
      typeof from === "string" &&
      typeof message === "string" &&
      !messages.some((msg) => msg.to === to && msg.from === from && msg.message === message)
    ) {
      addMessage({ id: Date.now(), to, from, message });
    }
  }, [to, from, message]);

  const addNewMessage = () => {
    router.push("/(app)/my-stars/private-star/messages/write-message");
  };

  const renderMessageCard = ({ item }: any) => (
    <TouchableOpacity onPress={() => setActiveMessage(item)}>
      <View style={styles.cardWrapper}>
        <View style={styles.cardContent}>
          <LetterIcon width={CARD_WIDTH} height={120} style={styles.letterSvg} />
          <Text style={styles.forText}>For: {item.to}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

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

      <View style={styles.moreWrapper}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <MoreIcon width={24} height={24} />
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(app)/my-stars/private-star/messages/delete-message")}
              >
              <DeleteIcon width={16} height={16} />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(app)/my-stars/private-star/messages/download-message")}
            >
              <DownloadIcon width={16} height={16} />
              <Text style={styles.menuText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.title}>Messages</Text>

      <FlatList
        data={messages}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderMessageCard}
      />

      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={addNewMessage}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      <Modal visible={!!activeMessage} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.modalMoreWrapper}
            onPress={() => setPopupMenuOpen(!popupMenuOpen)}
          >
            <MoreIcon width={24} height={24} />
          </TouchableOpacity>

          {popupMenuOpen && (
            <View style={styles.modalMenu}>
              <TouchableOpacity style={styles.menuItem}>
                <AddPeopleIcon width={16} height={16} />
                <Text style={styles.menuText}>Add people</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <SeeMembersIcon width={16} height={16} />
                <Text style={styles.menuText}>See members</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(app)/my-stars/private-star/messages/download-message")}
              >
                <EditIcon width={16} height={16} />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.letterPopup}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setActiveMessage(null);
                setPopupMenuOpen(false);
              }}
            >
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
            <Text style={styles.popupBody}>{activeMessage?.message}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  moreWrapper: { position: "absolute", top: 55, right: 20, zIndex: 20, alignItems: "flex-end" },
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
  modalMenu: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    zIndex: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  modalMoreWrapper: { position: "absolute", top: 55, right: 20, zIndex: 24 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuText: { fontSize: 13, fontFamily: "Alice-Regular", color: "#11152A" },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  list: { paddingHorizontal: 16, paddingBottom: 140 },
  cardWrapper: { width: CARD_WIDTH, margin: 8, alignItems: "center" },
  cardContent: { position: "relative", alignItems: "center", width: "100%" },
  letterSvg: { zIndex: 1 },
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  letterPopup: {
    backgroundColor: "#FFFDF7",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  popupBody: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#111",
    lineHeight: 22,
    marginTop: 30,
  },
});