// Bovenkant is identiek (imports, setup)
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
import DownloadIcon from "@/assets/images/svg-icons/download-white.svg";
import StarLoader from "@/components/loaders/StarLoader";
import { useMessageStore } from "@/lib/store/useMessageStore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 32;

export default function AddMessage() {
  const router = useRouter();
  const { to, from, message } = useLocalSearchParams();
  const { messages, addMessage } = useMessageStore();

  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    if (selectAll) {
      setSelectedMessages(messages.map((m) => m.id));
    } else {
      setSelectedMessages([]);
    }
  }, [selectAll, messages]);

  const toggleSelect = (id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const startDownload = () => {
    setShowDownloadPopup(false);
    setIsDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setSelectedMessages([]);
            setSelectAll(false);
            router.replace("/(app)/explores/private-files/messages/add-message");
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const renderMessageCard = ({ item }: any) => {
    const isSelected = selectedMessages.includes(item.id);
    return (
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <View style={styles.cardWrapper}>
          <View style={styles.cardContent}>
            <LetterIcon width={CARD_WIDTH} height={120} style={styles.letterSvg} />
            <Text style={styles.forText}>For: {item.to}</Text>
            <View style={styles.radioWrapper}>
              <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

      <Text style={styles.title}>Messages</Text>

      <View style={styles.selectAllWrapper}>
        <TouchableOpacity onPress={() => setSelectAll(!selectAll)}>
          <View style={styles.selectAllOption}>
            <View style={[styles.radioOuter, selectAll && styles.radioSelected]}>
              {selectAll && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.selectAllText}>All</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderMessageCard}
      />

      {/* Download status zichtbaar vanaf 0 berichten */}
      <TouchableOpacity
        style={styles.downloadTextContainer}
        onPress={() => selectedMessages.length > 0 && setShowDownloadPopup(true)}
        disabled={selectedMessages.length === 0}
      >
        <View style={styles.downloadTextRow}>
          <DownloadIcon width={16} height={16} style={{ marginRight: 6 }} />
          <Text style={styles.downloadText}>
            {selectedMessages.length} message
            {selectedMessages.length !== 1 ? "s" : ""} selected for download
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={showDownloadPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Are you sure you want to download the selected message(s)?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rightBorder]}
                onPress={() => setShowDownloadPopup(false)}
              >
                <Text style={styles.modalButtonTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={startDownload}>
                <Text style={styles.modalButtonTextYes}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isDownloading && (
        <View style={styles.loaderOverlay}>
          <StarLoader progress={progress} />
          <Text style={styles.loaderText}>Download...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  selectAllWrapper: {
    position: "absolute",
    top: 105,
    right: 20,
    zIndex: 10,
  },
  selectAllOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    fontSize: 13,
    fontFamily: "Alice-Regular",
    color: "#fff",
    marginLeft: 6,
  },
  list: { paddingHorizontal: 16, paddingBottom: 140, marginTop: 40 },
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
  radioWrapper: {
    position: "absolute",
    bottom: -20,
    alignSelf: "center",
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  radioSelected: {
    borderColor: "#FEEDB6",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FEEDB6",
  },
  downloadTextContainer: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  downloadTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  downloadText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  modalText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  modalButtonTextYes: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
  modalButtonTextNo: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
  loaderText: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#FEEDB6",
    marginTop: 12,
  },
});
