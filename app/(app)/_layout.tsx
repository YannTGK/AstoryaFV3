import { Tabs, usePathname, useRouter } from "expo-router";
import { Image, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useState } from "react";

export default function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("public");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/explores/${tab}`); // Navigate inside "explores"
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
        }}
      >
       <Tabs.Screen
          name="explores"
          options={{
            tabBarLabel: "Explore",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/icons/explore-active.png")
                    : require("@/assets/images/icons/explore.png")
                }
                style={styles.icon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dedicates"
          options={{
            tabBarLabel: "Dedicate",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/icons/dedicate-active.png")
                    : require("@/assets/images/icons/dedicate.png")
                }
                style={styles.icon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="my-stars"
          options={{
            tabBarLabel: "My Star",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/icons/my-star-active.png")
                    : require("@/assets/images/icons/my-star.png")
                }
                style={styles.icon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            tabBarLabel: "Account",
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require("@/assets/images/icons/account-active.png")
                    : require("@/assets/images/icons/account.png")
                }
                style={styles.icon}
              />
            ),
          }}
        />
      </Tabs>

      {/* ✅ Show Custom Explore Menu Only When Explore is Active */}
      {pathname.includes("explores") && (
        <>
          {/* Close button blijft altijd zichtbaar */}
          <View style={styles.exploreMenu}>
            <View style={styles.centered}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Image
                  source={
                    isMenuOpen
                      ? require("@/assets/images/icons/close.png") // Afbeelding voor open toestand
                      : require("@/assets/images/icons/open.png") // Afbeelding voor gesloten toestand
                  }
                  style={styles.navIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom menu alleen tonen als isMenuOpen true is */}
          {isMenuOpen && (
            <>
              {/* ✅ Circular Background */}
              <View style={styles.circleHolder}>
                <View style={styles.circle} />
              </View>

              {/* ✅ Public Button */}
              <View style={styles.publicHolder}>
                <TouchableOpacity
                  style={styles.publicPlacement}
                  onPress={() => handleTabPress("public")}
                >
                  <Image
                    source={
                      activeTab === "public"
                        ? require("@/assets/images/icons/public-active.png")
                        : require("@/assets/images/icons/public.png")
                    }
                    style={styles.icon}
                  />
                  <Text style={[styles.labelAround, activeTab === "public" && styles.activeText]}>
                    Public
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ✅ Private Button */}
              <View style={styles.publicHolder2}>
                <TouchableOpacity
                  style={styles.publicPlacement}
                  onPress={() => handleTabPress("private")}
                >
                  <Image
                    source={
                      activeTab === "private"
                        ? require("@/assets/images/icons/private-active.png")
                        : require("@/assets/images/icons/private.png")
                    }
                    style={styles.icon}
                  />
                  <Text style={[styles.labelAround, activeTab === "private" && styles.activeText]}>
                    Private
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ✅ Search Button */}
              <View style={styles.publicHolder3}>
                <TouchableOpacity
                  style={styles.publicPlacement}
                  onPress={() => handleTabPress("search")}
                >
                  <Image
                    source={
                      activeTab === "search"
                        ? require("@/assets/images/icons/search-active.png")
                        : require("@/assets/images/icons/search.png")
                    }
                    style={styles.icon}
                  />
                  <Text style={[styles.labelAround, activeTab === "search" && styles.activeText]}>
                    Search
                  </Text>
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
    height: 90,
    paddingBottom: 20,
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
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  exploreMenu: {
    position: "absolute",
    bottom: 60,
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
  navIcon: {
    width: 60,
    height: 60,
  },
  centered: {
    alignItems: "center",
  },
  circleHolder: {
    position: "absolute",
    bottom: 0,
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
    bottom: 100,
    left: "50%",
    marginLeft: -64,
    alignItems: "center",
    zIndex: 13,
  },
  publicHolder2: {
    position: "absolute",
    bottom: 130,
    left: "50%",
    marginLeft: -13,
    alignItems: "center",
    zIndex: 13,
  },
  publicHolder3: {
    position: "absolute",
    bottom: 100,
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
    fontWeight: "bold",
  },
});