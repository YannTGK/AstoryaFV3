import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PdfIcon from "@/assets/images/svg-icons/pdf-image.svg";
import WordIcon from "@/assets/images/svg-icons/word-image.svg";
import MoreIcon from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon from "@/assets/images/svg-icons/add-people.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";
import DownloadIcon from "@/assets/images/svg-icons/download.svg";
import EditIcon from "@/assets/images/svg-icons/edit2.svg";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";

import StarLoader from "@/components/loaders/StarLoader";

export default function Documents() {
  const router = useRouter();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const documents = [
    { name: "My_secret_recipe.pdf", date: "02/01/2025", type: "pdf" },
    { name: "Remember.docx", date: "30/12/2024", type: "word" },
    { name: "Passwords.pdf", date: "24/12/2024", type: "pdf" },
  ];

  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleDownloadPress = () => {
    setShowDownloadPopup(true);
    setOpenMenuIndex(null);
  };

  const startDownload = () => {
    setShowDownloadPopup(false);
    setIsDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsDownloading(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
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
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      {/* Edit-button rechtsboven */}
      <TouchableOpacity style={styles.editBtn}>
        <EditIcon width={30} height={30} />
      </TouchableOpacity>

      {/* Titel */}
      <Text style={styles.title}>Documenten</Text>

      {/* Loader bij download */}
      {isDownloading ? (
        <View style={styles.loaderContainer}>
          <StarLoader progress={progress} />
          <Text style={styles.loaderText}>Download...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {documents.map((doc, index) => (
            <View key={index} style={styles.documentRow}>
              {doc.type === "pdf" ? (
                <PdfIcon width={40} height={40} />
              ) : (
                <WordIcon width={40} height={40} />
              )}
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentDate}>{doc.date}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton} onPress={() => toggleMenu(index)}>
                <MoreIcon width={20} height={20} />
              </TouchableOpacity>

              {openMenuIndex === index && (
                <View style={styles.menu}>
                  <TouchableOpacity style={styles.menuItem}>
                    <AddPeopleIcon width={16} height={16} />
                    <Text style={styles.menuText}>Add people</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <DeleteIcon width={16} height={16} />
                    <Text style={styles.menuText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <SeeMembersIcon width={16} height={16} />
                    <Text style={styles.menuText}>See members</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={handleDownloadPress}>
                    <DownloadIcon width={16} height={16} />
                    <Text style={styles.menuText}>Download</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Gele plus-knop onderaan */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={() => console.log("Plus pressed")}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* Download bevestiging */}
      <Modal visible={showDownloadPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Are you sure you want to download the document?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.rightBorder]} onPress={() => setShowDownloadPopup(false)}>
                <Text style={styles.modalButtonTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={startDownload}>
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
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  editBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  scrollContainer: {
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  documentName: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    marginBottom: 2,
  },
  documentDate: {
    fontFamily: "Alice-Regular",
    fontSize: 12,
    color: "#ccc",
  },
  moreButton: {
    padding: 8,
  },
  menu: {
    position: "absolute",
    top: 35,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    width: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  menuText: {
    fontSize: 14,
    fontFamily: "Alice-Regular",
    color: "#11152A",
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 75,
  },
  loaderText: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#FEEDB6",
    marginTop: 12,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
});
