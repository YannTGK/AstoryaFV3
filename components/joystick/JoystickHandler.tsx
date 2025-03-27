import React from "react";
import Joystick from "./JoystickDesign";
import { THREE } from "expo-three";

console.log("✅ Joystick is loading!");

export default function JoystickHandler({ cameraPosition, cameraRotation }) {
  const handleJoystickMove = (x, y) => {
    const moveSpeed = 1;

    // Calculate forward vector based on camera rotation
    const forwardVector = new THREE.Vector3(0, 0, -1);
    forwardVector.applyEuler(
      new THREE.Euler(cameraRotation.current.x, cameraRotation.current.y, 0)
    );
    forwardVector.normalize();

    // Calculate right vector based on camera rotation
    const rightVector = new THREE.Vector3(1, 0, 0);
    rightVector.applyEuler(
      new THREE.Euler(cameraRotation.current.x, cameraRotation.current.y, 0)
    );
    rightVector.normalize();

    // Update camera position: right movement and forward movement
    cameraPosition.current.x += x * rightVector.x * moveSpeed;
    cameraPosition.current.y += x * rightVector.y * moveSpeed;
    cameraPosition.current.z += x * rightVector.z * moveSpeed;

    cameraPosition.current.x += y * forwardVector.x * moveSpeed;
    cameraPosition.current.y += y * forwardVector.y * moveSpeed;
    cameraPosition.current.z += y * forwardVector.z * moveSpeed;
  };

  return (
    <Joystick onMove={handleJoystickMove} />
  );
}