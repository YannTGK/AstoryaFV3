import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import Svg, { Path } from "react-native-svg";

const NUM_STARS = 8;

export default function StarLoader({ progress }: { progress: number }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // rotatie animatie
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // twinkle / pulse animatie
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const stars = Array.from({ length: NUM_STARS }).map((_, i) => {
    const angle = (i * 360) / NUM_STARS;
    const radius = 80; // grotere cirkel
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);

    return (
      <Animated.View
        key={i}
        style={{
          position: "absolute",
          transform: [
            { translateX: x },
            { translateY: y },
            { scale: pulse }, // laat sterren ademen
          ],
          shadowColor: "#FEEDB6",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 6,
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 32 32" fill="none">
          <Path
            fill="#FEEDB6"
            d="M16 2l3.09 9.26H29l-7.45 5.41 2.85 8.85L16 22.2l-8.4 5.32L10.45 16.7 3 11.26h9.91L16 2z"
          />
        </Svg>
      </Animated.View>
    );
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orbit, { transform: [{ rotate: spin }] }]}>
        {stars}
      </Animated.View>
      <Text style={styles.percentage}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  orbit: {
    position: "absolute",
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    color: "#FEEDB6",
    fontSize: 24,
    fontFamily: "Alice-Regular",
  },
});
