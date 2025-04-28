import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PdfIcon from "@/assets/images/svg-icons/pdf-image.svg";
import WordIcon from "@/assets/images/svg-icons/word-image.svg";
import MoreIcon from "@/assets/images/svg-icons/more.svg";
import UploadIcon from "@/assets/images/svg-icons/upload-icon.svg";
import AddPeopleIcon from "@/assets/images/svg-icons/add-people.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";
import DownloadIcon from "@/assets/images/svg-icons/download.svg";

export default function Documents() {
  const router = useRouter();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const documents = [
    { name: "My_secret_recipe.pdf", date: "02/01/2025", type: "pdf" },
    { name: "Remember.docx", date: "30/12/2024", type: "word" },
    { name: "Passwords.pdf", date: "24/12/2024", type: "pdf" },
  ];

  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
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

      {/* Upload-button */}
      <TouchableOpacity style={styles.uploadBtn}>
        <UploadIcon width={30} height={30} />
      </TouchableOpacity>

      {/* Titel */}
      <Text style={styles.title}>Documenten</Text>

      {/* Documentlijst */}
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

            {/* Menu */}
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
                <TouchableOpacity style={styles.menuItem}>
                  <DownloadIcon width={16} height={16} />
                  <Text style={styles.menuText}>Download</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  uploadBtn: {
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
});
