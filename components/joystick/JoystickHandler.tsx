import React from 'react';
import Joystick from './JoystickDesign';
import * as THREE from 'three'; // ✅ niet { THREE }, maar * as THREE

type Props = {
  cameraPosition: React.MutableRefObject<{ x: number; y: number; z: number }>;
  cameraRotation: React.MutableRefObject<{ x: number; y: number }>;
  disabled?: boolean;
};

export default function JoystickHandler({
  cameraPosition,
  cameraRotation,
  disabled = false,
}: Props) {
  const handleJoystickMove = (x: number, y: number) => {
    if (disabled) return;

    const moveSpeed = 1;

    const forwardVector = new THREE.Vector3(0, 0, -1);
    forwardVector
      .applyEuler(new THREE.Euler(cameraRotation.current.x, cameraRotation.current.y, 0))
      .normalize();

    const rightVector = new THREE.Vector3(1, 0, 0);
    rightVector
      .applyEuler(new THREE.Euler(cameraRotation.current.x, cameraRotation.current.y, 0))
      .normalize();

    cameraPosition.current.x += x * rightVector.x * moveSpeed;
    cameraPosition.current.y += x * rightVector.y * moveSpeed;
    cameraPosition.current.z += x * rightVector.z * moveSpeed;

    cameraPosition.current.x += y * forwardVector.x * moveSpeed;
    cameraPosition.current.y += y * forwardVector.y * moveSpeed;
    cameraPosition.current.z += y * forwardVector.z * moveSpeed;
  };

  return <Joystick onMove={handleJoystickMove} />;
}
