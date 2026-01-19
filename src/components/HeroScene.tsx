'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function BloomSphere() {
  const mesh = useRef<THREE.Mesh>(null!);
  const scroll = useScroll();

  useFrame(() => {
    const t = scroll.offset; // 0 → 1

    // Calm, intentional motion
    mesh.current.position.z = THREE.MathUtils.lerp(6, 2, t);
    mesh.current.rotation.y = t * Math.PI * 0.5;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(0.9, 1.2, t));
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#8b5cf6"
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1} />

        <ScrollControls pages={1.5} damping={0.2}>
          <BloomSphere />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
