'use client';
import { Sparkles } from '@react-three/drei';

export function SteamParticles() {
  return (
    <group position={[0, 1.2, 0]}>
      <Sparkles
        raycast={() => {}} 
        count={20} 
        scale={[1.5, 2, 1.5]} 
        size={4} 
        speed={0.4} 
        opacity={0.2} 
        color="white" 
      />
    </group>
  );
}
