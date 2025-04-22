import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import useAuthStore from "@/lib/store/useAuthStore";

// SVG iconen
import VisibilityIcon from "@/assets/images/svg-icons/visibility-options.svg";
import AccountIcon from "@/assets/images/svg-icons/account-icon.svg";
import AddedAccountsIcon from "@/assets/images/svg-icons/added-accounts.svg";
import PaymentMethodsIcon from "@/assets/images/svg-icons/payments-methods.svg";
import EditPasswordIcon from "@/assets/images/svg-icons/edit-password.svg";
import DeleteAccountIcon from "@/assets/images/svg-icons/delete-accounts.svg";
import EditIcon from "@/assets/images/svg-icons/edit.svg";

export default function Account2Screen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Terug knop */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>My account</Text>

      {/* Profiel header gecentreerd */}
      <View style={styles.profileWrapper}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
          <TouchableOpacity style={styles.editCircle}>
            <EditIcon width={16} height={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      {/* Account-opties */}
      <Option icon={<AccountIcon width={22} height={22} />} label="My profile" onPress={() => router.push("/(app)/accounts/my-account/my-profile")} />
      <Option icon={<VisibilityIcon width={22} height={22} />} label="Visibility options" onPress={() => router.push("/(app)/accounts/my-account/visibility")} />
      <Option icon={<AddedAccountsIcon width={22} height={22} />} label="Added accounts" />
      <Option icon={<PaymentMethodsIcon width={22} height={22} />} label="Payment methods" />
      <Option icon={<EditPasswordIcon width={22} height={22} />} label="Edit password" />
      <Option icon={<DeleteAccountIcon width={22} height={22} />} label="Delete account" />
    </View>
  );
}

function Option({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress?: () => void }) {
    return (
      <TouchableOpacity style={styles.optionRow} onPress={onPress}>
        {icon}
        <Text style={styles.optionLabel}>{label}</Text>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    );
  }  

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  profileWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: "#FEEDB6",
  },
  editCircle: {
    position: "absolute",
    right: 4,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FEEDB6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FEEDB6",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  username: {
    color: "#ccc",
    fontSize: 14,
    fontFamily: "Alice-Regular",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    flex: 1,
    marginLeft: 14,
  },
});
