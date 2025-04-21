import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import SearchIcon from "@/assets/images/svg-icons/search.svg";
import FilterIcon from "@/assets/images/svg-icons/filter.svg";
import CloseIcon from "@/assets/images/svg-icons/close-icon2.svg";
import { useLayoutStore } from "@/lib/store/layoutStore";

export default function SearchPublic() {
  const router = useRouter();
  const setIsSearching = useLayoutStore((state) => state.setIsSearching);
  const [showAllStars, setShowAllStars] = useState(true);
  const [showOnlyMyStars, setShowOnlyMyStars] = useState(false);

  const handleClose = () => {
    setIsSearching(false); // Zet search mode uit
    router.replace("/explores/public"); // Ga terug naar public
  };

  return (
    <View style={styles.container}>
      {/* Sluitknop rechtsboven */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <CloseIcon width={18} height={18} />
      </TouchableOpacity>

      {/* Zoekbalk */}
      <View style={styles.searchContainer}>
        <SearchIcon width={20} height={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Filterknop */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => router.push("/explores/filter")}
        >
        <Text style={styles.filterText}>Filter</Text>
        <FilterIcon width={18} height={18} />
      </TouchableOpacity>

      {/* Toggle 1 */}
      <View style={styles.toggleBlock}>
        <View style={styles.toggleHeader}>
          <Text style={styles.toggleTitle}>Show all stars</Text>
          <Switch
            value={showAllStars}
            onValueChange={setShowAllStars}
            thumbColor={showAllStars ? "#FEEDB6" : "#ccc"}
            trackColor={{ false: "#555", true: "#FEEDB6" }}
          />
        </View>
        <Text style={styles.toggleDesc}>
          Turn this off to hide all public stars that you don’t know.
          To see only public stars from family and friends. This option is only available if
          ‘Show only my stars’ is turned on.
        </Text>
      </View>

      {/* Toggle 2 */}
      <View style={styles.toggleBlock}>
        <View style={styles.toggleHeader}>
          <Text style={styles.toggleTitle}>Show only my stars</Text>
          <Switch
            value={showOnlyMyStars}
            onValueChange={setShowOnlyMyStars}
            thumbColor={showOnlyMyStars ? "#FEEDB6" : "#ccc"}
            trackColor={{ false: "#555", true: "#FEEDB6" }}
          />
        </View>
        <Text style={styles.toggleDesc}>
          Enable this to highlight and prioritize stars from family and friends in the starry sky.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: "#0B1022",
  },
  closeButton: {
    position: "absolute",
    top: 25,
    right: 20,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    marginTop: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  filterButton: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: "#FEEDB6",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  filterText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
  },
  toggleBlock: {
    marginTop: 10,
    marginBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2F45",
    paddingBottom: 16,
  },
  toggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  toggleDesc: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Alice-Regular",
    lineHeight: 18,
  },
});
