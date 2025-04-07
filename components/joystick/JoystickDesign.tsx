import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Animated, PanResponder, Text } from "react-native";

export default function Joystick({ onMove }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const lastDirection = useRef({ x: 0, y: 0 });
  const isActive = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        isActive.current = true;
        const maxDistance = 64; 
        const distance = Math.sqrt(gesture.dx ** 2 + gesture.dy ** 2);

        let normalizedX, normalizedY;
        if (distance <= maxDistance) {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
          normalizedX = gesture.dx / maxDistance;
          normalizedY = gesture.dy / maxDistance;
        } else {
          const ratio = maxDistance / distance;
          pan.setValue({
            x: gesture.dx * ratio,
            y: gesture.dy * ratio,
          });
          normalizedX = (gesture.dx * ratio) / maxDistance;
          normalizedY = (gesture.dy * ratio) / maxDistance;
        }

        lastDirection.current = { x: normalizedX, y: -normalizedY };
        if (onMove) {
          onMove(normalizedX, -normalizedY);
        }
      },
      onPanResponderRelease: () => {
        isActive.current = false;
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
        if (onMove) onMove(0, 0);
      },
    })
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive.current && lastDirection.current && onMove) {
        const { x, y } = lastDirection.current;
        onMove(x, y);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [onMove]);

  return (
    <View style={styles.joystickContainer}>
      <View style={styles.joystickBase}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.joystickHandle, { transform: pan.getTranslateTransform() }]}
        >
          <Text style={[styles.arrow, styles.arrowUp]}>^</Text>
          <Text style={[styles.arrow, styles.arrowRight]}>^</Text>
          <Text style={[styles.arrow, styles.arrowDown]}>^</Text>
          <Text style={[styles.arrow, styles.arrowLeft]}>^</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  joystickContainer: {
    position: "absolute",
    bottom: 130,
    right: 30, 
    width: 128, 
    height: 128, 
  },
  joystickBase: {
    width: 128, 
    height: 128, 
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 64, 
    justifyContent: "center",
    alignItems: "center",
  },
  joystickHandle: {
    width: 64, 
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 32, 
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "regular",
    color: "white",
  },
  arrowUp: {
    top: 4,
    left: "50%",
    transform: [{ translateX: -6 }, { rotate: "0deg" }],
  },
  arrowDown: {
    bottom: 4,
    left: "50%",
    transform: [{ translateX: -6 }, { rotate: "180deg" }],
  },
  arrowLeft: {
    left: 16,
    top: "50%",
    transform: [{ translateY: -19 }, { rotate: "270deg" }],
  },
  arrowRight: {
    right: 16,
    top: "50%",
    transform: [{ translateY: -19 }, { rotate: "90deg" }],
  },
});