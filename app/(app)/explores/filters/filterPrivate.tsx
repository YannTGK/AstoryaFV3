// app/(app)/explores/filters/PrivateFilter.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import Svg, { Path } from "react-native-svg";
import StarLoader from "../../../../components/loaders/StarLoader";
import { useFilterStore } from "@/lib/store/filterStore";

export default function PrivateFilter() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from: string }>();

  // lokale state
  const [dob, setDob] = useState("");
  const [dod, setDod] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("BE");
  const [countryName, setCountryName] = useState("Belgium");

  const [coordX, setCoordX] = useState("");
  const [coordY, setCoordY] = useState("");
  const [coordZ, setCoordZ] = useState("");

  // laad-/progress-state
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);

  // **hier** halen we de setFilters uit de store
  const { setFilters, resetFilters } = useFilterStore();

  // reset filters als je dit scherm opent
  useEffect(() => {
    resetFilters();
  }, []);

  // alleen cijfers, min-teken en komma of punt toestaan
  const handleCoordInput = (text: string, setter: (v: string) => void) => {
    if (/^-?\d*(?:[.,]\d*)?$/.test(text)) {
      setter(text);
    }
  };

  const handleApplyFilter = () => {
    // 1️⃣ schrijf de filters in de store
    setFilters({
      dob,
      dod,
      country: countryName,
      coordX,
      coordY,
      coordZ,
    });

    // 2️⃣ animatie + redirect terug
    setLoading(true);
    setProgress(0);
    let current = 0;
    const iv = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          setLoading(false);
          router.replace(
            from === "private"
              ? "/explores/private"
              : "/explores/public"
          );
        }, 300);
      }
    }, 100);
  };

  const handleBack = () => {
    router.replace(
      from === "private"
        ? "/explores/search-private"
        : "/explores/search-public"
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      {/* header */}
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>Filter sterren</Text>
      </View>

      {/* DOB */}
      <Text style={styles.label}>Date of birth</Text>
      <TextInput
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={dob}
        onChangeText={setDob}
      />

      {/* DOD */}
      <Text style={styles.label}>Date of death</Text>
      <TextInput
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={dod}
        onChangeText={setDod}
      />

      {/* Country */}
      <Text style={styles.label}>Country</Text>
      <View style={styles.pickerWrapper}>
        <CountryPicker
          countryCode={countryCode}
          withFlag
          withFilter
          withCountryNameButton
          onSelect={(c: Country) => {
            setCountryCode(c.cca2 as CountryCode);
            setCountryName(c.name);
          }}
          containerButtonStyle={styles.countryButton}
        />
        <Text style={styles.countryText}>{countryName}</Text>
      </View>

      {/* Coordinates */}
      <Text style={styles.label}>Coordinates</Text>
      <View style={styles.coordRow}>
        <TextInput
          placeholder="X (bv. -25,3)"
          placeholderTextColor="#aaa"
          style={[styles.input, styles.coordInput]}
          value={coordX}
          onChangeText={t => handleCoordInput(t, setCoordX)}
          keyboardType="default"
        />
        <TextInput
          placeholder="Y (bv. 0)"
          placeholderTextColor="#aaa"
          style={[styles.input, styles.coordInput]}
          value={coordY}
          onChangeText={t => handleCoordInput(t, setCoordY)}
          keyboardType="default"
        />
        <TextInput
          placeholder="Z (bv. 480,2)"
          placeholderTextColor="#aaa"
          style={[styles.input, styles.coordInput]}
          value={coordZ}
          onChangeText={t => handleCoordInput(t, setCoordZ)}
          keyboardType="default"
        />
      </View>

      {/* Apply */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleApplyFilter}>
          <Text style={styles.buttonText}>Apply filter</Text>
        </TouchableOpacity>
      </View>

      {/* Loader */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <StarLoader progress={progress} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#0B1022", paddingHorizontal:20, paddingBottom:20 },
  titleRow: { flexDirection:"row", alignItems:"center", justifyContent:"center", marginBottom:10, position:"relative" },
  backBtn: { position:"absolute", left:0, padding:4 },
  title:{ fontFamily:"Alice-Regular", fontSize:20, color:"#fff" },
  label:{ color:"#fff", fontSize:14, fontFamily:"Alice-Regular", marginTop:16, marginBottom:6 },
  input:{ backgroundColor:"#fff", borderRadius:8, paddingVertical:10, paddingHorizontal:14, fontSize:14 },
  pickerWrapper:{ flexDirection:"row", alignItems:"center", backgroundColor:"#fff", borderRadius:8, height:44, paddingHorizontal:10 },
  countryButton:{ flexDirection:"row", alignItems:"center" },
  countryText:{ marginLeft:8, fontSize:14, color:"#000", fontFamily:"Alice-Regular" },
  coordRow:{ flexDirection:"row", justifyContent:"space-between" },
  coordInput:{ flex:1, marginRight:8 },
  buttonWrapper:{ marginTop:25, marginBottom:20 },
  button:{ backgroundColor:"#FEEDB6", paddingVertical:14, borderRadius:12, elevation:6 },
  buttonText:{ fontSize:16, color:"#000", fontFamily:"Alice-Regular", textAlign:"center" },
  loaderOverlay:{ position:"absolute", top:0,left:0,right:0,bottom:0, backgroundColor:"rgba(0,0,0,0.85)", justifyContent:"center", alignItems:"center", zIndex:10 },
});