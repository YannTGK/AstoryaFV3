import { useRef, useEffect } from 'react';
import Star from './StarDesign';
import { THREE } from 'expo-three';

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10001;
  return x - Math.floor(x);
}

type Props = {
  scene: THREE.Scene;
};

export default function StarsManager({ scene }: Props) {
  const starsRef = useRef<Star[]>([]);
  const seed = 42;

  useEffect(() => {
    const numStars = 30;
    const sizeRange = [2.5, 3.5];
    const positionRange = 500;

    for (let i = 0; i < numStars; i++) {
      const uniqueSeed = seed + i;
      const sizeVal = seededRandom(uniqueSeed) * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
      const size: [number, number, number] = [sizeVal, sizeVal, sizeVal];

      const position: [number, number, number] = [
        (seededRandom(uniqueSeed * 1.1) - 0.5) * positionRange * 2,
        (seededRandom(uniqueSeed * 1.2) - 0.5) * positionRange * 2,
        (seededRandom(uniqueSeed * 1.3) - 0.5) * positionRange * 2,
      ];

      const star = new Star({ position, size, id: `star_${i}` });

      const hue = seededRandom(uniqueSeed * 37);
      const color = new THREE.Color();
      color.setHSL(hue, 0.2, 0.5);
      star.userData.color = color;

      star.userData.content = [
        {
          type: 'richText',
          source: `<h1>In Loving Memory of Star ${i}</h1><p>This star shines bright.</p>`,
        },
        {
          type: 'image',
          source: require('../../assets/images/oudeDame.jpg'),
        },
      ];

      starsRef.current.push(star);
      scene.add(star);
    }

    return () => {
      starsRef.current.forEach((star) => scene.remove(star));
      starsRef.current = [];
    };
  }, [scene]);

  return null;
}