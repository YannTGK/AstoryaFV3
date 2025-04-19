import { Tabs, usePathname, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useState } from "react";

import ExploreIcon from "@/assets/images/svg-icons/explore.svg";
import ExploreActiveIcon from "@/assets/images/svg-icons/explore-active.svg";
import DedicateIcon from "@/assets/images/svg-icons/dedicate.svg";
import DedicateActiveIcon from "@/assets/images/svg-icons/dedicate-active.svg";
import MyStarIcon from "@/assets/images/svg-icons/my-star.svg";
import MyStarActiveIcon from "@/assets/images/svg-icons/my-star-active.svg";
import AccountIcon from "@/assets/images/svg-icons/account.svg";
import AccountActiveIcon from "@/assets/images/svg-icons/account-active.svg";
import PublicIcon from "@/assets/images/svg-icons/public.svg";
import PublicActiveIcon from "@/assets/images/svg-icons/public-active.svg";
import PrivateIcon from "@/assets/images/svg-icons/private.svg";
import PrivateActiveIcon from "@/assets/images/svg-icons/private-active.svg";
import SearchIcon from "@/assets/images/svg-icons/search.svg";
import SearchActiveIcon from "@/assets/images/svg-icons/search-active.svg";
import CloseIcon from "@/assets/images/svg-icons/closea.svg";
import OpenIcon from "@/assets/images/svg-icons/open.svg";

export default function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("public");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabPress = (tab: "public" | "private" | "search") => {
    setActiveTab(tab);
    router.replace(`/explores/${tab}`);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: "#273166",
          tabBarInactiveTintColor: "#C4C4C4",
          tabBarIconStyle: styles.tabIcon,
        }}
      >
        <Tabs.Screen
          name="explores"
          options={{
            tabBarLabel: "Explore",
            tabBarIcon: ({ focused }) =>
              focused ? <ExploreActiveIcon width={28} height={28} /> : <ExploreIcon width={28} height={28} />,
          }}
        />
        <Tabs.Screen
          name="dedicates"
          options={{
            tabBarLabel: "Dedicate",
            tabBarIcon: ({ focused }) =>
              focused ? <DedicateActiveIcon width={28} height={28} /> : <DedicateIcon width={28} height={28} />,
          }}
        />
        <Tabs.Screen
          name="my-stars"
          options={{
            tabBarLabel: "My Star",
            tabBarIcon: ({ focused }) =>
              focused ? <MyStarActiveIcon width={28} height={28} /> : <MyStarIcon width={28} height={28} />,
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            tabBarLabel: "Account",
            tabBarIcon: ({ focused }) =>
              focused ? <AccountActiveIcon width={26} height={26} /> : <AccountIcon width={26} height={26} />,
          }}
        />
      </Tabs>

      {pathname.includes("explores") && (
        <>
          <View style={styles.exploreMenu}>
            <View style={styles.centered}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <CloseIcon width={60} height={60} /> : <OpenIcon width={60} height={60} />}
              </TouchableOpacity>
            </View>
          </View>

          {isMenuOpen && (
            <>
              <View style={styles.circleHolder}>
                <View style={styles.circle} />
              </View>

              <View style={styles.publicHolder}>
                <TouchableOpacity style={styles.publicPlacement} onPress={() => handleTabPress("public")}>
                  {activeTab === "public" ? <PublicActiveIcon width={28} height={28} /> : <PublicIcon width={28} height={28} />}
                  <Text style={[styles.labelAround, activeTab === "public" && styles.activeText]}>Public</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.publicHolder2}>
                <TouchableOpacity style={styles.publicPlacement} onPress={() => handleTabPress("private")}>
                  {activeTab === "private" ? <PrivateActiveIcon width={28} height={28} /> : <PrivateIcon width={28} height={28} />}
                  <Text style={[styles.labelAround, activeTab === "private" && styles.activeText]}>Private</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.publicHolder3}>
                <TouchableOpacity style={styles.publicPlacement} onPress={() => handleTabPress("search")}>
                  {activeTab === "search" ? <SearchActiveIcon width={26} height={26} /> : <SearchIcon width={26} height={26} />}
                  <Text style={[styles.labelAround, activeTab === "search" && styles.activeText]}>Search</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "white",
    position: "absolute",
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: "Alice-Regular",
  },
  tabIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  exploreMenu: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    zIndex: 11,
  },
  closeButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    zIndex: 15,
  },
  centered: {
    alignItems: "center",
  },
  circleHolder: {
    position: "absolute",
    bottom: -10,
    width: "100%",
    alignItems: "center",
    zIndex: 9,
  },
  circle: {
    width: 180,
    height: 185,
    backgroundColor: "white",
    opacity: 0.5,
    borderRadius: 100,
  },
  publicHolder: {
    position: "absolute",
    bottom: 90,
    left: "50%",
    marginLeft: -64,
    alignItems: "center",
    zIndex: 13,
  },
  publicHolder2: {
    position: "absolute",
    bottom: 120,
    left: "50%",
    marginLeft: -13,
    alignItems: "center",
    zIndex: 13,
  },
  publicHolder3: {
    position: "absolute",
    bottom: 90,
    left: "50%",
    marginLeft: 39,
    alignItems: "center",
    zIndex: 13,
  },
  publicPlacement: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  labelAround: {
    fontSize: 10,
    color: "#C4C4C4",
    fontFamily: "Alice-Regular",
  },
  activeText: {
    color: "#FEEDB6",
    fontFamily: "Alice-Regular",
  },
});
