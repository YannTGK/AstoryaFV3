// app/(app)/my-stars/private-star/messages/write-message/WriteMessage.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

import api from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";

import PlusIcon from "@/assets/images/svg-icons/plus.svg";

type Contact = { _id: string; username: string };

export default function WriteMessage() {
  /* ── router & params ────────────────────────────── */
  const router = useRouter();
  const { id: starId } = useLocalSearchParams<{ id?: string }>();

  /* ── globale user ───────────────────────────────── */
  const { user } = useAuthStore();

  /* ── state (form + UI) ──────────────────────────── */
  const [to, setTo]                 = useState<Contact | null>(null);
  const [message, setMessage]       = useState("");
  const [contacts, setContacts]     = useState<Contact[]>([]);
  const [loadingContacts, setLC]    = useState(true);
  const [showContacts, setShowC]    = useState(false);
  const [saving, setSaving]         = useState(false);

  /* ── contacten laden ────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ contacts: Contact[] }>("/users/me/contacts");
        setContacts(res.data.contacts);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch contacts.");
      } finally {
        setLC(false);
      }
    })();
  }, []);

  /* ── form validatie ─────────────────────────────── */
  const allFilled =
    !!starId &&                 // star-id is verplicht
    !!to &&                     // ontvanger gekozen
    message.trim().length > 0;  // tekst ingevuld

  /* ── save naar backend ───────────────────────────── */
  const handleSave = async () => {
    if (!allFilled) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await api.post(`/stars/${starId}/messages`, {
        message,
        canView: [to!._id],
      });
      router.back();            // terug naar lijst
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not send the message.");
    } finally {
      setSaving(false);
    }
  };

  /* ── UI ─────────────────────────────────────────── */
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        {/* achtergrond-gradient */}
        <LinearGradient
          colors={["#000000", "#273166", "#000000"]}
          style={StyleSheet.absoluteFill}
        />

        {/* ← Back */}
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
          </Svg>
        </TouchableOpacity>

        <Text style={st.title}>Write Message</Text>

        {/* formulier */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            contentContainerStyle={st.form}
            keyboardShouldPersistTaps="handled"
          >
            {/* FROM */}
            <Text style={st.label}>From:</Text>
            <TextInput
              style={[st.input, { backgroundColor: "#eee" }]}
              editable={false}
              value={
                user ? `${user.firstName} ${user.lastName}` : "Unknown user"
              }
            />

            {/* TO */}
            <Text style={st.label}>To:</Text>
            <TouchableOpacity
              style={st.inputRow}
              onPress={() => setShowC(true)}
            >
              <Text style={to ? st.inputText : st.placeholder}>
                {to ? `@${to.username}` : "Select a contact…"}
              </Text>
              <PlusIcon width={24} height={24} />
            </TouchableOpacity>

            {/* MESSAGE */}
            <Text style={st.label}>Message:</Text>
            <TextInput
              style={st.textArea}
              placeholder="Write your message here…"
              placeholderTextColor="#888"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ADD knop */}
        <View style={st.addWrapper}>
          <TouchableOpacity
            style={[
              st.addBtn,
              (!allFilled || saving) && st.addBtnDisabled,
            ]}
            disabled={!allFilled || saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color="#11152A" />
            ) : (
              <Text style={st.addText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CONTACT-modal */}
        <Modal visible={showContacts} transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={st.modalCard}>
              <Text style={st.modalTitle}>Select contact</Text>
              {loadingContacts ? (
                <ActivityIndicator color="#FEEDB6" size="large" />
              ) : (
                <FlatList
                  data={contacts}
                  keyExtractor={(c) => c._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={st.contactItem}
                      onPress={() => {
                        setTo(item);
                        setShowC(false);
                      }}
                    >
                      <Text style={st.contactTxt}>@{item.username}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity onPress={() => setShowC(false)}>
                <Text style={st.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

/* ─── Styles ───────────────────────────────────────── */
const st = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  form: { padding: 20, paddingBottom: 160, gap: 14 },

  label: { color: "#fff", fontFamily: "Alice-Regular", marginBottom: 4 },

  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
  },
  inputRow: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: { fontFamily: "Alice-Regular", fontSize: 14, color: "#000" },
  placeholder: { fontFamily: "Alice-Regular", fontSize: 14, color: "#888" },

  textArea: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
    height: 160,
  },

  addWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  addBtn: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnDisabled: { opacity: 0.6 },
  addText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
  },

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginBottom: 12,
  },
  contactItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  contactTxt: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#111",
  },
  cancel: {
    marginTop: 14,
    textAlign: "center",
    color: "#FEEDB6",
    fontFamily: "Alice-Regular",
    fontSize: 14,
  },
});