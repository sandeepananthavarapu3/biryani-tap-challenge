"use client";
import { useSpring, a } from '@react-spring/three';
import { GamePhase } from '@/types';

export function ChickenPiece({ show }: { show: boolean; gamePhase: GamePhase }) {
  const { y, scale } = useSpring({
    from: { y: 0.5, scale: 0 },
    y: show ? 1.65 : 0.5,
    scale: show ? 1 : 0,
    config: { tension: 350, friction: 20 },
  });
  return (
    <a.group position-y={y} scale={scale}>
      <group rotation={[0, 0, -0.45]}>
        <mesh castShadow scale={[0.42, 0.53, 0.36]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color="#b94c16" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.57, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.13, 0.45, 12]} />
          <meshStandardMaterial color="#fff0ce" roughness={0.75} />
        </mesh>
        {[-0.09, 0.09].map(x => (
          <mesh key={x} position={[x, 0.8, 0]}>
            <sphereGeometry args={[0.14, 12, 8]} />
            <meshStandardMaterial color="#fff0ce" />
          </mesh>
        ))}
      </group>
    </a.group>
  );
}
