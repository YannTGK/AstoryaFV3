// app/(app)/my-stars/private-star/messages/SeeMessages.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import NoMessageIcon from "@/assets/images/svg-icons/no-message.svg";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import LetterIcon from "@/assets/images/svg-icons/letter.svg";
import MoreIcon from "@/assets/images/svg-icons/more.svg";
import CloseIcon from "@/assets/images/svg-icons/close-icon.svg";
import AddPeopleIcon from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";
import EditIcon from "@/assets/images/svg-icons/edit.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete.svg";
import DownloadIcon from "@/assets/images/svg-icons/download.svg";
import api from "@/services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 32;

export default function SeeMessages() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [popupMenuOpen, setPopup] = useState(false);
  const [activeMessage, setActive] = useState<any | null>(null);

  // Fetch messages when screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchMessages = async () => {
        if (!id) return;
        setLoading(true);
        try {
          const res = await api.get(`/stars/${id}/messages`);
          if (isActive) setMessages(res.data);
        } catch (err) {
          console.error("Failed to fetch messages:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchMessages();
      return () => {
        isActive = false;
      };
    }, [id])
  );

  const addNewMessage = () => {
    router.push({
      pathname: "/(app)/my-stars/private-star/messages/write-message",
      params: { id },
    });
  };

  const renderMessageCard = ({ item }: any) => (
    <TouchableOpacity onPress={() => setActive(item)}>
      <View style={styles.cardWrapper}>
        <View style={styles.cardContent}>
          <LetterIcon
            width={CARD_WIDTH}
            height={120}
            style={styles.letterSvg}
          />
          <Text style={styles.forText}>For: {item.sender}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ← Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path
            d="M15 18l-6-6 6-6"
            stroke="#FEEDB6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Messages</Text>

      {messages.length === 0 ? (
        <View style={styles.centeredContent}>
          <NoMessageIcon width={140} height={140} />
          <Text style={styles.emptyText}>No messages found</Text>
        </View>
      ) : (
        <>
          {/* bulk menu */}
          <View style={styles.moreWrapper}>
            <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
              <MoreIcon width={24} height={24} />
            </TouchableOpacity>
            {menuOpen && (
              <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                  <DeleteIcon width={16} height={16} />
                  <Text style={styles.menuText}>Delete all</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <DownloadIcon width={16} height={16} />
                  <Text style={styles.menuText}>Download all</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FlatList
            data={messages}
            numColumns={2}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={renderMessageCard}
          />
        </>
      )}

      {/* + knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={addNewMessage}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* detail modal */}
      <Modal
        visible={!!activeMessage}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          {/* per-item menu */}
          <TouchableOpacity
            style={styles.modalMoreWrapper}
            onPress={() => setPopup(!popupMenuOpen)}
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
                onPress={() =>
                  router.push({
                    pathname:
                      "/(app)/my-stars/private-star/messages/edit-message",
                    params: { id, messageId: activeMessage._id },
                  })
                }
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
                setActive(null);
                setPopup(false);
              }}
            >
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
            <Text style={styles.popupBody}>
              {activeMessage?.message}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
  },
  emptyText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginTop: 8,
  },
  moreWrapper: {
    position: "absolute",
    top: 55,
    right: 20,
    zIndex: 20,
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
  menuItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuText: {
    fontSize: 13,
    fontFamily: "Alice-Regular",
    color: "#11152A",
    marginLeft: 4,
  },
  list: { paddingHorizontal: 16, paddingBottom: 140 },
  cardWrapper: { width: CARD_WIDTH, margin: 8, alignItems: "center" },
  cardContent: {
    position: "relative",
    alignItems: "center",
    width: "100%",
  },
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
  modalMoreWrapper: { position: "absolute", top: 55, right: 20, zIndex: 24 },
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
  letterPopup: {
    backgroundColor: "#FFFDF7",
    borderRadius: 8,
    padding: 20,
    width: "100%",
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