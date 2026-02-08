/**
 * OfficeZones - The 3 Colored Zones (Research, Ideation, Strategy)
 * Each zone glows based on current game phase
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { GamePhase } from '../../store/gameStore'

interface OfficeZonesProps {
  currentPhase: GamePhase
}

interface Zone {
  name: string
  position: [number, number, number]
  color: string
  emissiveColor: string
  activePhase: GamePhase
}

const zones: Zone[] = [
  {
    name: 'Research Lab',
    position: [-5, 0, 0],
    color: '#00F0FF',      // Neon Cyan
    emissiveColor: '#00F0FF',
    activePhase: 'RESEARCHING'
  },
  {
    name: 'Ideation Arena',
    position: [0, 0, 0],
    color: '#FFD600',      // Safety Yellow
    emissiveColor: '#FFD600',
    activePhase: 'VALIDATING'
  },
  {
    name: 'Strategy Room',
    position: [5, 0, 0],
    color: '#BD00FF',      // Deep Purple
    emissiveColor: '#BD00FF',
    activePhase: 'STRATEGIZING'
  }
]

function ZoneCube({ zone, isActive }: { zone: Zone; isActive: boolean }) {
  const meshRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)

  // Pulsing glow animation when active
  useFrame((state) => {
    if (isActive && meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7
      meshRef.current.scale.setScalar(1 + pulse * 0.05)

      // Update emissive intensity
      if ('emissiveIntensity' in meshRef.current.material) {
        (meshRef.current.material as any).emissiveIntensity = pulse * 2
      }

      // Glow ring scale
      glowRef.current.scale.setScalar(1 + pulse * 0.2)
    } else if (meshRef.current && 'emissiveIntensity' in meshRef.current.material) {
      // Dim when inactive
      (meshRef.current.material as any).emissiveIntensity = 0.1
    }
  })

  return (
    <group position={zone.position}>
      {/* Main Zone Box */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshPhysicalMaterial
          color={zone.color}
          emissive={zone.emissiveColor}
          emissiveIntensity={isActive ? 1.5 : 0.1}
          metalness={0.2}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Glowing Border/Edge */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <boxGeometry args={[3.1, 2.1, 3.1]} />
        <meshBasicMaterial
          color={zone.emissiveColor}
          transparent
          opacity={isActive ? 0.4 : 0.1}
          wireframe
        />
      </mesh>

      {/* Floor Highlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial
          color={zone.emissiveColor}
          transparent
          opacity={isActive ? 0.3 : 0.05}
        />
      </mesh>

      {/* Zone Label (3D Text Placeholder - use simple geometry for now) */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={zone.emissiveColor}
          emissive={zone.emissiveColor}
          emissiveIntensity={isActive ? 2 : 0.5}
        />
      </mesh>
    </group>
  )
}

export default function OfficeZones({ currentPhase }: OfficeZonesProps) {
  return (
    <>
      {zones.map((zone) => (
        <ZoneCube
          key={zone.name}
          zone={zone}
          isActive={currentPhase === zone.activePhase}
        />
      ))}

      {/* Connection Lines Between Zones */}
      <group>
        {/* Research → Ideation */}
        <mesh position={[-2.5, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshBasicMaterial
            color="#00F0FF"
            transparent
            opacity={currentPhase === 'RESEARCHING' ? 0.8 : 0.2}
          />
        </mesh>

        {/* Ideation → Strategy */}
        <mesh position={[2.5, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshBasicMaterial
            color="#BD00FF"
            transparent
            opacity={currentPhase === 'STRATEGIZING' ? 0.8 : 0.2}
          />
        </mesh>
      </group>

      {/* Particle Effects (Simple floating orbs) */}
      {currentPhase !== 'IDLE' && (
        <group>
          {[...Array(10)].map((_, i) => (
            <FloatingParticle
              key={i}
              position={[
                (Math.random() - 0.5) * 15,
                Math.random() * 3,
                (Math.random() - 0.5) * 15
              ]}
              color={
                currentPhase === 'RESEARCHING' ? '#00F0FF' :
                currentPhase === 'VALIDATING' ? '#FFD600' :
                '#BD00FF'
              }
            />
          ))}
        </group>
      )}
    </>
  )
}

// Floating particle effect
function FloatingParticle({ position, color }: { position: [number, number, number]; color: string }) {
  const particleRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (particleRef.current) {
      particleRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.01
      particleRef.current.rotation.y += 0.02
    }
  })

  return (
    <mesh ref={particleRef} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}
