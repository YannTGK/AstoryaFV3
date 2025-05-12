// app/(app)/explores/public/SearchPublic.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLayoutStore } from "@/lib/store/layoutStore";
import { useFilterStore } from "@/lib/store/filterStore";
import api from "@/services/api";

import SearchIcon from "@/assets/images/svg-icons/search.svg";
import FilterIcon from "@/assets/images/svg-icons/filter.svg";
import CloseIcon from "@/assets/images/svg-icons/close-icon2.svg";

export default function SearchPublic() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setIsSearching = useLayoutStore((s) => s.setIsSearching);
  const showOnlyMine = useLayoutStore((s) => s.showOnlyMine);
  const setShowOnlyMine = useLayoutStore((s) => s.setShowOnlyMine);

  // store hooks
  const { searchQuery } = useFilterStore();
  const setFilters = useFilterStore((s) => s.setFilters);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const [rawStars, setRawStars] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  // 1️⃣ Fetch public stars
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/public")).data;
        setRawStars(stars);
      } catch (err) {
        console.error("Failed to load stars:", err);
      }
    })();
  }, []);

  // 2️⃣ Reset filters + lokale zoektekst + toggle guard bij mount
  useEffect(() => {
    resetFilters();
    setSearchText("");
    if (!showOnlyMine) setShowOnlyMine(false);
  }, []);

  const close = () => {
    setIsSearching(false);
    router.replace("/explores/public");
  };

  // 3️⃣ Update zoekterm lokaal & in store
  const onChangeSearch = useCallback(
    (text: string) => {
      setSearchText(text);
      setFilters({ searchQuery: text });
    },
    [setFilters]
  );

  // 4️⃣ Suggesties filteren
  const suggestions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return rawStars.filter((s) =>
      s.publicName.toLowerCase().includes(q)
    );
  }, [searchText, rawStars]);

  // 5️⃣ Format createdAt
  const formatCreatedAt = (iso?: string) => {
    if (!iso) return "";
    const [Y, M, D] = iso.slice(0, 10).split("-");
    return `${D}/${M}/${Y}`;
  };

  // 6️⃣ Klik op suggestie → sla op in store en sluit
  const goToStar = useCallback(
    (id: string) => {
      setFilters({ selectedStarId: id });
      setIsSearching(false);
      router.replace("/explores/public");
    },
    [router, setIsSearching, setFilters]
  );

  const renderSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={st.suggestionItem}
      onPress={() => goToStar(item._id)}
    >
      <Text style={st.suggestionText}>
        {item.publicName}, {item.user?.country} – created{" "}
        {formatCreatedAt(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[st.wrap, { paddingTop: insets.top }]} edges={["top","left","right"]}>
      <TouchableOpacity
        style={[st.close, { top: insets.top + 10 }]}
        onPress={close}
        hitSlop={{ top:10,bottom:10,left:10,right:10 }}
      >
        <CloseIcon width={18} height={18}/>
      </TouchableOpacity>

      {/* Zoekbalk */}
      <View style={st.row}>
        <SearchIcon width={20} height={20} style={{ marginRight:10 }}/>
        <TextInput
          style={st.input}
          placeholder="Search by name…"
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={onChangeSearch}
        />
      </View>

      {/* Suggestie-kaart */}
      {searchText.length > 0 && (
        <View style={st.suggestionsCard}>
          {suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(star) => star._id}
              renderItem={renderSuggestion}
              nestedScrollEnabled
              style={st.suggestionsList}
            />
          ) : (
            <Text style={st.noResults}>No stars found</Text>
          )}
        </View>
      )}

      {/* Filter-knop */}
      <TouchableOpacity
        style={st.filterBtn}
        onPress={() =>
          router.push({
            pathname: "/explores/filters/filterPublic",
            params: { from: "public" },
          })
        }
      >
        <Text style={st.filterTxt}>Filter</Text>
        <FilterIcon width={18} height={18}/>
      </TouchableOpacity>

      {/* Toggle */}
      <View style={st.block}>
        <View style={st.head}>
          <Text style={st.title}>Show only my stars</Text>
          <Switch
            value={showOnlyMine}
            onValueChange={setShowOnlyMine}
            thumbColor={showOnlyMine ? "#FEEDB6" : "#ccc"}
            trackColor={{ false:"#555", true:"#FEEDB6" }}
          />
        </View>
        <Text style={st.desc}>
          Hide public stars you don’t have access to and bring your own stars closer together.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  wrap:            { flex:1, backgroundColor:"#0B1022", paddingHorizontal:20 },
  close:           { position:"absolute", right:20, zIndex:10 },
  row:             { flexDirection:"row", alignItems:"center", backgroundColor:"#fff", borderRadius:22, paddingHorizontal:14, height:44, marginTop:20 },
  input:           { flex:1, fontSize:16, color:"#000" },
  suggestionsCard: { marginTop:8, backgroundColor:"#fff", borderRadius:12, paddingVertical:8, paddingHorizontal:12, maxHeight:300 },
  suggestionsList: { flexGrow:0 },
  suggestionItem:  { paddingVertical:10, borderBottomWidth:1, borderBottomColor:"#eee" },
  suggestionText:  { fontSize:16, color:"#000" },
  noResults:       { paddingVertical:12, fontSize:14, color:"#888", textAlign:"center" },
  filterBtn:       { flexDirection:"row", alignSelf:"flex-end", marginTop:20, marginBottom:10, backgroundColor:"#FEEDB6", paddingVertical:10, paddingHorizontal:18, borderRadius:8, alignItems:"center", gap:6 },
  filterTxt:       { fontFamily:"Alice-Regular", fontSize:14, color:"#000" },
  block:           { marginTop:10, borderBottomWidth:1, borderBottomColor:"#2A2F45", paddingBottom:16 },
  head:            { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  title:           { color:"#fff", fontSize:16, fontFamily:"Alice-Regular" },
  desc:            { color:"#aaa", fontSize:13, marginTop:4, lineHeight:18, fontFamily:"Alice-Regular" },
});