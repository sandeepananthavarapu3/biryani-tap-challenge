'use client';
import { OrthographicCamera } from 'three';
import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, SoftShadows } from '@react-three/drei';
import { Bowl } from './Bowl';
import { GamePhase } from '@/types';

interface BiryaniSceneProps {
  onReady: () => void;
  targetBowl: number | null;
  showChicken: boolean;
  onBowlTap: (bowlIndex: number) => void;
  gamePhase: GamePhase;
  disabled: boolean;
}

// 2 rows of 3 bowls
const BOWL_POSITIONS: [number, number, number][] = [
  [-2.2, 0, -1.5], [0, 0, -1.5], [2.2, 0, -1.5],
  [-2.2, 0, 1.5],  [0, 0, 1.5],  [2.2, 0, 1.5]
];

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 9, 7);
    camera.lookAt(0, 0.5, 0);
    if (camera instanceof OrthographicCamera) {
      camera.zoom = Math.min(size.width / 8.2, size.height / 7.5);
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

export default function BiryaniScene({ onReady, targetBowl, showChicken, onBowlTap, gamePhase, disabled }: BiryaniSceneProps) {
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 9, 7], zoom: 70 }}
      style={{ touchAction: 'none', pointerEvents: 'auto' }}
      gl={{ antialias: true, alpha: false }}
    >
      <SceneReady onReady={onReady} />
      <ResponsiveCamera />
      <color attach="background" args={['#382317']} />
      <SoftShadows size={20} samples={10} focus={0.5} />
      
      <ambientLight intensity={0.4} color="#ffedd6" />
      <directionalLight
        castShadow
        position={[5, 8, 5]}
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-left={-5}
        shadow-camera-right={5}
      />
      <Environment preset="sunset" />

      {/* Table/Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#795035" roughness={0.9} />
      </mesh>

      {/* Bowls */}
      {BOWL_POSITIONS.map((pos, index) => (
        <Bowl
          key={index}
          index={index}
          position={pos}
          isTarget={targetBowl === index}
          showChicken={showChicken}
          onTap={onBowlTap}
          disabled={disabled}
          gamePhase={gamePhase}
        />
      ))}
    </Canvas>
  );
}
