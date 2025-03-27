import { PanResponder } from 'react-native';
import * as THREE from 'three';

type SetupControlsProps = {
  cameraPosition: React.MutableRefObject<{ x: number; y: number; z: number }>;
  cameraRotation: React.MutableRefObject<{ x: number; y: number }>;
};

export function setupControls({ cameraPosition, cameraRotation }: SetupControlsProps) {
  const lastPinchDistance = { current: 0 };

  return PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length >= 2) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastPinchDistance.current === 0) {
          lastPinchDistance.current = distance;
        } else {
          const pinchDelta = distance - lastPinchDistance.current;
          lastPinchDistance.current = distance;

          const forwardVector = new THREE.Vector3(0, 0, -1);
          forwardVector.applyEuler(
            new THREE.Euler(cameraRotation.current.x, cameraRotation.current.y, 0)
          );
          forwardVector.normalize();

          const moveFactor = -0.1;
          const displacement = -pinchDelta * moveFactor;

          cameraPosition.current.x += forwardVector.x * displacement;
          cameraPosition.current.y += forwardVector.y * displacement;
          cameraPosition.current.z += forwardVector.z * displacement;
        }
      } else {
        cameraRotation.current.x -= gesture.dy * 0.00015;
        cameraRotation.current.y -= gesture.dx * 0.00015;
        lastPinchDistance.current = 0;
      }
    },
    onPanResponderRelease: () => {
      lastPinchDistance.current = 0;
    },
  });
}