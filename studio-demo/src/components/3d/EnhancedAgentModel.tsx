/**
 * EnhancedAgentModel - Better looking agent character
 * Procedural robot design with head, body, arms, legs
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import { Agent } from '../../store/gameStore'

interface EnhancedAgentModelProps {
  agent: Agent
}

export default function EnhancedAgentModel({ agent }: EnhancedAgentModelProps) {
  const groupRef = useRef<Group>(null)
  const bodyRef = useRef<Mesh>(null)
  const headRef = useRef<Mesh>(null)
  const leftArmRef = useRef<Mesh>(null)
  const rightArmRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!groupRef.current || !bodyRef.current || !headRef.current) return

    // Animations based on status
    if (agent.status === 'WORKING') {
      // Head nod
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.1
      }

      // Arms swing
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.3
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.sin(state.clock.elapsedTime * 3) * 0.3
      }

      // Body bounce
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05

      // Rotation
      groupRef.current.rotation.y += 0.01
    } else if (agent.status === 'SUCCESS') {
      // Gentle hover
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02

      // Head slightly tilted up
      if (headRef.current) {
        headRef.current.rotation.x = -0.2
      }
    } else if (agent.status === 'IDLE') {
      // Breathing
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      bodyRef.current.scale.setScalar(scale)
      bodyRef.current.position.y = 0
    }
  })

  return (
    <group ref={groupRef}>
      {/* Body (Main torso) */}
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.4]} />
        <meshPhysicalMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={agent.status === 'WORKING' ? 1.5 : 0.3}
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshPhysicalMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={agent.status === 'WORKING' ? 2 : 0.5}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Eyes (glowing) */}
      <mesh position={[-0.1, 0.75, 0.21]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={agent.status === 'WORKING' ? 3 : 1}
        />
      </mesh>
      <mesh position={[0.1, 0.75, 0.21]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={agent.status === 'WORKING' ? 3 : 1}
        />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.35, 0.2, 0]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshPhysicalMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.35, 0.2, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshPhysicalMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.15, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshPhysicalMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={0.2}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.15, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshPhysicalMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={0.2}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      {/* Antenna (when working) */}
      {agent.status === 'WORKING' && (
        <group position={[0, 1.1, 0]}>
          {/* Antenna rod */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
            <meshBasicMaterial color={agent.color} />
          </mesh>
          {/* Antenna tip (pulsing) */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial
              color={agent.color}
              emissive={agent.color}
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      )}

      {/* Success crown */}
      {agent.status === 'SUCCESS' && (
        <mesh position={[0, 1.2, 0]} rotation={[0, state => state.clock.elapsedTime, 0]}>
          <torusGeometry args={[0.3, 0.05, 8, 32]} />
          <meshBasicMaterial
            color="#00FF00"
            emissive="#00FF00"
            emissiveIntensity={2}
          />
        </mesh>
      )}
    </group>
  )
}
