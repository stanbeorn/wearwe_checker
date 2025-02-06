import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { NFTBox } from './NFTDisplayBox';
import * as THREE from 'three';

// Camera controller with auto-reset and hologram effect
function CameraController({ controlsRef }) {
  const { camera } = useThree();
  const lastInteraction = useRef(Date.now());
  const isAutoRotating = useRef(true);
  const initialY = useRef(camera.position.y);

  useFrame(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    
    // Auto-rotation (hologram effect)
    if (isAutoRotating.current) {
      const time = Date.now() * 0.001;
      const targetAngle = Math.sin(time) * 0.3; // Increased range for more visible effect
      controls.setAzimuthalAngle(targetAngle);
    }

    // Check if we should reset after user interaction
    const timeSinceLastInteraction = Date.now() - lastInteraction.current;
    if (timeSinceLastInteraction > 1000 && !isAutoRotating.current) {
      const currentAngle = controls.getAzimuthalAngle();
      controls.setAzimuthalAngle(THREE.MathUtils.lerp(currentAngle, 0, 0.1));
      
      if (Math.abs(currentAngle) < 0.01) {
        isAutoRotating.current = true;
      }
    }

    controls.update();
  });

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      const handleStart = () => {
        lastInteraction.current = Date.now();
        isAutoRotating.current = false;
      };

      controls.addEventListener('start', handleStart);
      return () => controls.removeEventListener('start', handleStart);
    }
  }, [controlsRef]);

  return null;
}

export function NFTDisplay() {
  const controlsRef = useRef();
  // NFT image URLs - 9 NFTs
  const nftImages = [
    '/nft_1.png',
    '/nft_2.png',
    '/nft_3.png',
    '/nft_4.png',
    '/nft_269.png',
    '/nft_6.png',
    '/nft_7.png',
    '/nft_8.png',
    '/nft_9.png'
  ];

  return (
    <div className="nft-display-container" style={{ 
      width: '100vw', // Full viewport width
      height: '100vh', // Full viewport height
      position: 'fixed', // Fixed position to cover full page
      top: 0,
      left: 0,
      background: 'transparent',
      borderRadius: '12px',
      overflow: 'hidden',
      zIndex: 1,
      pointerEvents: 'none' // Allow clicking through the container
    }}>
      <div className="nft-display" style={{ 
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto' // Re-enable pointer events for the 3D content
      }}>
        <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
          <PerspectiveCamera makeDefault position={[0, -2, 12]} />
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2} // Set both polar angles to PI/2 to lock vertical movement
            minPolarAngle={Math.PI / 2} // This will prevent up/down rotation
            maxDistance={12}
            minDistance={8}
            maxZoom={2}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
          />
          <CameraController controlsRef={controlsRef} />
          
          {/* Lighting optimized for color accuracy */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <ContactShadows
              position={[0, -4, 0]}
              opacity={0.2}
              scale={40}
              blur={2}
              far={10}
              color="#558f6d"
            />
            
            {/* Display boxes in a 3x3 grid with tighter spacing */}
            <group position={[0, -1, 0]} rotation={[0, 0, Math.PI]}>
              {/* Top row */}
              <NFTBox position={[-2.5, 2, 0]} imageUrl={nftImages[0]} />
              <NFTBox position={[0, 2, 0]} imageUrl={nftImages[1]} />
              <NFTBox position={[2.5, 2, 0]} imageUrl={nftImages[2]} />
              
              {/* Middle row */}
              <NFTBox position={[-2.5, 0, 0]} imageUrl={nftImages[3]} />
              <NFTBox position={[0, 0, 0]} imageUrl={nftImages[4]} />
              <NFTBox position={[2.5, 0, 0]} imageUrl={nftImages[5]} />

              {/* Bottom row */}
              <NFTBox position={[-2.5, -2, 0]} imageUrl={nftImages[6]} />
              <NFTBox position={[0, -2, 0]} imageUrl={nftImages[7]} />
              <NFTBox position={[2.5, -2, 0]} imageUrl={nftImages[8]} />
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
