/**
 * AgentAvatars - 3D representations of the 3 AI agents
 * Animated based on their current status and position
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, Vector3 } from 'three'
import { useGameStore, selectAgents, Agent } from '../../store/gameStore'
import { Text } from '@react-three/drei'
import EnhancedAgentModel from './EnhancedAgentModel'

function AgentAvatar({ agent }: { agent: Agent }) {
  const groupRef = useRef<Group>(null)
  const bodyRef = useRef<Mesh>(null)
  const targetPosition = useRef(new Vector3(agent.position.x, agent.position.y, agent.position.z))

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return

    // Smooth movement to target position (lerp)
    const current = groupRef.current.position
    const target = targetPosition.current
    current.lerp(target, delta * 2) // Smooth interpolation

    // Update target if agent position changed
    if (
      agent.position.x !== target.x ||
      agent.position.y !== target.y ||
      agent.position.z !== target.z
    ) {
      target.set(agent.position.x, agent.position.y, agent.position.z)
    }

    // Animations based on status
    if (agent.status === 'WORKING') {
      // Bounce animation
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.5
      // Rotate
      bodyRef.current.rotation.y += delta * 2
      // Scale pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
      bodyRef.current.scale.setScalar(scale)
    } else if (agent.status === 'SUCCESS') {
      // Gentle hover
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 + 0.5
    } else if (agent.status === 'IDLE') {
      // Idle breathing
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      bodyRef.current.scale.setScalar(scale)
      bodyRef.current.position.y = 0.5
    }
  })

  return (
    <group ref={groupRef} position={[agent.position.x, agent.position.y, agent.position.z]}>
      {/* Enhanced Agent Model */}
      <group ref={bodyRef} position={[0, 0.5, 0]}>
        <EnhancedAgentModel agent={agent} />
      </group>

      {/* Agent Name Label */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {agent.name}
      </Text>

      {/* Progress Bar (when working) */}
      {agent.status === 'WORKING' && agent.progress > 0 && (
        <group position={[0, -0.8, 0]}>
          {/* Background */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
          </mesh>
          {/* Progress Fill */}
          <mesh position={[-(1 - agent.progress / 100) / 2, 0, 0.02]}>
            <planeGeometry args={[agent.progress / 100, 0.08]} />
            <meshBasicMaterial
              color={agent.color}
              emissive={agent.color}
              emissiveIntensity={1}
            />
          </mesh>
          {/* Progress Text */}
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {Math.round(agent.progress)}%
          </Text>
        </group>
      )}

      {/* Shadow circle on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default function AgentAvatars() {
  const agents = useGameStore(selectAgents)

  return (
    <>
      <AgentAvatar agent={agents.researcher} />
      <AgentAvatar agent={agents.validator} />
      <AgentAvatar agent={agents.strategist} />
    </>
  )
}
