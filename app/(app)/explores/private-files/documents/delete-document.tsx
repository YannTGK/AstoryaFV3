import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PdfIcon from "@/assets/images/svg-icons/pdf-image.svg";
import WordIcon from "@/assets/images/svg-icons/word-image.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete-white.svg";

const { width } = Dimensions.get("window");

export default function DeleteDocument() {
  const router = useRouter();
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const documents = [
    { id: 1, name: "My_secret_recipe.pdf", date: "02/01/2025", type: "pdf" },
    { id: 2, name: "Remember.docx", date: "30/12/2024", type: "word" },
    { id: 3, name: "Passwords.pdf", date: "24/12/2024", type: "pdf" },
  ];

  useEffect(() => {
    if (selectAll) {
      setSelectedDocs(documents.map((doc) => doc.id));
    } else {
      setSelectedDocs([]);
    }
  }, [selectAll]);

  const toggleSelect = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const confirmDelete = () => {
    setShowDeletePopup(false);
    setSelectedDocs([]);
    setSelectAll(false);
    router.replace("/(app)/explores/private-files/documents/documents");
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selectedDocs.includes(item.id);
    return (
      <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.docRow}>
        {/* Bolletje links */}
        <View style={styles.radioWrapper}>
          <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>

        {/* Documenticon */}
        {item.type === "pdf" ? (
          <PdfIcon width={40} height={40} />
        ) : (
          <WordIcon width={40} height={40} />
        )}

        {/* Documentinfo */}
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{item.name}</Text>
          <Text style={styles.docDate}>{item.date}</Text>
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

      {/* Titel */}
      <Text style={styles.title}>Documents</Text>

      {/* Select all toggle */}
      <TouchableOpacity style={styles.selectAllToggle} onPress={() => setSelectAll(!selectAll)}>
        <View style={[styles.radioOuter, selectAll && styles.radioSelected]}>
          {selectAll && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.selectAllText}>All</Text>
      </TouchableOpacity>

      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      {/* Delete info onderaan */}
      <TouchableOpacity
        style={styles.bottomDeleteBar}
        onPress={() => selectedDocs.length > 0 && setShowDeletePopup(true)}
        disabled={selectedDocs.length === 0}
      >
        <DeleteIcon width={16} height={16} style={{ marginRight: 6 }} />
        <Text style={styles.deleteText}>
          {selectedDocs.length} document{selectedDocs.length !== 1 ? "s" : ""} selected
        </Text>
      </TouchableOpacity>

      {/* Popup */}
      <Modal visible={showDeletePopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Are you sure you want to delete the selected document(s)?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rightBorder]}
                onPress={() => setShowDeletePopup(false)}
              >
                <Text style={styles.modalButtonTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                <Text style={styles.modalButtonTextYes}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  selectAllToggle: {
    position: "absolute",
    top: 105,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    fontSize: 13,
    fontFamily: "Alice-Regular",
    color: "#fff",
    marginLeft: 6,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 140,
    marginTop: 40,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  radioWrapper: {
    marginRight: 14,
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
  docInfo: {
    flex: 1,
    marginLeft: 14,
  },
  docName: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    marginBottom: 2,
  },
  docDate: {
    fontFamily: "Alice-Regular",
    fontSize: 12,
    color: "#ccc",
  },
  bottomDeleteBar: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },
  deleteText: {
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
});
