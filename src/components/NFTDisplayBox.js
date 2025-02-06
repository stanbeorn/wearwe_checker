import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export function NFTBox({ position, imageUrl, direction = 1 }) {
  const groupRef = useRef();
  
  // Load the NFT texture with proper color management
  const texture = useLoader(THREE.TextureLoader, imageUrl || '/nft_1.png');
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false; // Fix orientation

  // Make sure texture maintains aspect ratio
  const aspectRatio = texture.image ? texture.image.width / texture.image.height : 1;
  
  // Brand colors
  const mainColor = new THREE.Color('#558f6d').convertSRGBToLinear();
  const accentColor = new THREE.Color('#96bc73').convertSRGBToLinear(); // Sage green
  const lightColor = new THREE.Color('#b0dae7').convertSRGBToLinear();
  
  // Frame material (solid, not transparent)
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: mainColor,
    metalness: 0.1,
    roughness: 0.3,
    envMapIntensity: 1,
  });

  // Corner material
  const cornerMaterial = new THREE.MeshStandardMaterial({
    color: lightColor,
    metalness: 0.2,
    roughness: 0.4,
    envMapIntensity: 0.8,
  });

  // NFT display material with proper color management
  const nftMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    side: THREE.FrontSide
  });

  // Box dimensions adjusted for NFT proportions
  const width = 1.8;
  const height = width / aspectRatio;
  const depth = 0.15; // Thinner depth
  const borderWidth = 0.04; // Thinner border
  const cornerSize = 0.08; // Smaller corner size

  // Calculate NFT dimensions to fit inside the frame
  const nftWidth = width - borderWidth * 2;
  const nftHeight = height - borderWidth * 2;

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Back panel */}
      <mesh position={[0, 0, -depth/2]} material={frameMaterial}>
        <boxGeometry args={[width, height, 0.02]} />
      </mesh>

      {/* NFT display (slightly in front of back panel) */}
      <mesh position={[0, 0, -depth/2 + 0.015]} renderOrder={1}>
        <planeGeometry args={[nftWidth, nftHeight]} />
        <primitive object={nftMaterial} />
      </mesh>

      {/* Frame pieces */}
      <mesh position={[-width/2 + borderWidth/2, 0, 0]} material={frameMaterial}>
        <boxGeometry args={[borderWidth, height, depth]} />
      </mesh>
      <mesh position={[width/2 - borderWidth/2, 0, 0]} material={frameMaterial}>
        <boxGeometry args={[borderWidth, height, depth]} />
      </mesh>
      <mesh position={[0, height/2 - borderWidth/2, 0]} material={frameMaterial}>
        <boxGeometry args={[width, borderWidth, depth]} />
      </mesh>
      <mesh position={[0, -height/2 + borderWidth/2, 0]} material={frameMaterial}>
        <boxGeometry args={[width, borderWidth, depth]} />
      </mesh>

      {/* Corner decorations */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], index) => (
        <group key={index} position={[x * (width/2 - cornerSize/2), y * (height/2 - cornerSize/2), 0]}>
          <mesh material={cornerMaterial} renderOrder={2}>
            <boxGeometry args={[cornerSize, cornerSize, depth + 0.01]} /> {/* Slightly thicker than frame */}
          </mesh>
        </group>
      ))}

      {/* Top hang tab */}
      <group position={[0, height/2 + 0.12, 0]}>
        <mesh material={frameMaterial}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} rotation={[Math.PI/2, 0, 0]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={frameMaterial}>
          <boxGeometry args={[0.25, 0.2, 0.08]} />
        </mesh>
      </group>
    </group>
  );
}
