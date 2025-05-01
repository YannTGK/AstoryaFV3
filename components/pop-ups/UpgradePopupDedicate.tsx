import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
  } from "react-native";
  import { useState } from "react";
  import { LinearGradient } from "expo-linear-gradient";
  import { useRouter } from "expo-router";
  
  // ✨ SVG importeren
  import CloseIcon from "@/assets/images/svg-icons/close-icon.svg";
  
  const { width, height } = Dimensions.get("window");
  
  type Props = {
    onClose: () => void;
  };
  
  export default function UpgradePopupDedicate({ onClose }: Props) {
    const [showBasic, setShowBasic] = useState(false);
    const router = useRouter();
  
    const handleTryFree = () => {
      onClose(); // Popup eerst sluiten
      router.push("/dedicates/create-a-dedicate/start-dedicate-star"); // Daarna navigeren
    };
  
    return (
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#000000DD", "#000000DD"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.popupWrapper}>
          <View style={styles.popup}>
            {/* ❌ Close-icon via SVG */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <CloseIcon width={24} height={24} />
            </TouchableOpacity>
  
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.heading}>
                IT'S TIME FOR YOU TO{"\n"}UPGRADE! ✦
              </Text>
              <View style={styles.blueLine} />
  
              {showBasic ? (
                <>
                  <Text style={styles.planTitle}>BASIC PLAN</Text>
                  <Text style={styles.planPrice}>FREE</Text>
  
                  <View style={styles.list}>
                    <Text style={styles.listItem}>✓ Explore the starry sky</Text>
                    <Text style={styles.listItem}>✓ Personal starry sky</Text>
                    <Text style={styles.listItem}>✓ 3D/VR experience</Text>
                    <Text style={styles.listItem}>✓ Download memories</Text>
                  </View>
  
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowBasic(false)}
                  >
                    <Text style={styles.buttonText}>Go back</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.planTitle}>BUY FOR LOVED ONES</Text>
                  <Text style={styles.planPrice}>
                    € 1,99 <Text style={styles.perMonth}>/month</Text>
                  </Text>
  
                  <View style={styles.list}>
                    <Text style={styles.listItem}>✓ Dedicated star</Text>
                    <Text style={styles.listItem}>✓ Life's story</Text>
                    <Text style={styles.listItem}>✓ Automatic activation</Text>
                    <Text style={styles.listItem}>✓ Full control</Text>
                    <Text style={styles.listItem}>✓ Add public content in 3D/VR</Text>
                    <Text style={styles.listItem}>✓ Download anytime</Text>
                  </View>
  
                  <TouchableOpacity style={styles.tryBtn} onPress={handleTryFree}>
                    <Text style={styles.tryBtnText}>Try FREE for 30 days</Text>
                  </TouchableOpacity>
  
                  <Text style={styles.activationFee}>€9.99 activation fee</Text>
  
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 999,
      justifyContent: "center",
      alignItems: "center",
    },
    popupWrapper: {
      maxHeight: height - 110,
      marginBottom: 55,
      justifyContent: "center",
      alignItems: "center",
    },
    popup: {
      width: width * 0.9,
      backgroundColor: "#fff",
      borderRadius: 20,
      maxHeight: height * 0.8,
    },
    scrollContent: {
      paddingVertical: 26,
      paddingHorizontal: 20,
      alignItems: "center",
      flexGrow: 1,
    },
    closeBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 10,
    },
    heading: {
      fontFamily: "Alice-Regular",
      fontSize: 18,
      textAlign: "center",
      color: "#273166",
      marginBottom: 12,
    },
    planTitle: {
      fontFamily: "Alice-Regular",
      fontSize: 20,
      textAlign: "center",
      color: "#273166",
      marginTop: 8,
    },
    planPrice: {
      fontSize: 18,
      color: "#008B7C",
      fontFamily: "Alice-Regular",
      marginVertical: 8,
      textAlign: "center",
    },
    perMonth: {
      fontSize: 14,
      color: "#333",
    },
    list: {
      alignSelf: "stretch",
      marginVertical: 8,
      paddingLeft: 10,
    },
    listItem: {
      fontSize: 14,
      color: "#273166",
      marginVertical: 4,
      fontFamily: "Alice-Regular",
      flexWrap: "wrap",
      flexShrink: 1,
      lineHeight: 20,
    },
    tryBtn: {
      backgroundColor: "#FEE8A0",
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 32,
      width: "100%",
      marginTop: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    tryBtnText: {
      color: "#111",
      fontSize: 16,
      fontFamily: "Alice-Regular",
      textAlign: "center",
      textAlignVertical: "center",
      flexShrink: 1,
      marginBottom: 1,
      marginTop: -1,
    },
    activationFee: {
      fontSize: 12,
      color: "#008B7C",
      marginTop: 6,
      fontFamily: "Alice-Regular",
    },
    secondaryLink: {
      marginTop: 12,
      fontSize: 14,
      textDecorationLine: "underline",
      color: "#273166",
      fontFamily: "Alice-Regular",
    },
    button: {
      backgroundColor: "#11152A",
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      marginTop: 20,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Alice-Regular",
      textAlign: "center",
      textAlignVertical: "center",
      flexShrink: 1,
    },
    blueLine: {
      height: 1,
      width: "100%",
      backgroundColor: "#273166",
      marginTop: 8,
      marginBottom: 16,
    },
  });
  