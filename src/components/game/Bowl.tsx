'use client';
import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { GamePhase } from '@/types';
import { ChickenPiece } from './ChickenPiece';
import { SteamParticles } from './SteamParticles';
import { useSpring, a } from '@react-spring/three';

interface BowlProps {
  position: [number, number, number];
  index: number;
  isTarget: boolean;
  showChicken: boolean;
  onTap: (index: number) => void;
  disabled: boolean;
  gamePhase: GamePhase;
}

export function Bowl({ position, index, isTarget, showChicken, onTap, disabled, gamePhase }: BowlProps) {
  const [hovered, setHovered] = useState(false);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!disabled) {
      onTap(index);
    }
  };

  const { scale } = useSpring({
    scale: 1,
    config: { mass: 1, tension: 300, friction: 10 }
  });

  return (
    <a.group 
      position={position} 
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
    >
      {/* Bowl Base (Handi) */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.82, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#B87333" roughness={0.6} metalness={0.5} />
      </mesh>

      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.8, 0.055, 10, 32]} />
        <meshStandardMaterial color="#e6ad65" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.79, 0]} scale={[1, 0.16, 1]} receiveShadow>
        <sphereGeometry args={[0.76, 24, 12]} />
        <meshStandardMaterial color="#efcf85" roughness={1} />
      </mesh>
      {Array.from({ length: 65 }, (_, grain) => {
        const angle = grain * 2.39996;
        const radius = 0.71 * Math.sqrt((grain + 0.5) / 65);
        return (
          <mesh key={grain} position={[Math.cos(angle) * radius, 0.82 + 0.1 * (1 - radius / 0.76), Math.sin(angle) * radius]} rotation={[0, angle, 0]} scale={[0.035, 0.022, 0.095]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial color={['#fff3cf', '#f5a623', '#fff8e2', '#d97818', '#69923b'][grain % 5]} roughness={1} />
          </mesh>
        );
      })}

      <SteamParticles />

      {isTarget && (
        <ChickenPiece show={showChicken} gamePhase={gamePhase} />
      )}
    </a.group>
  );
}
