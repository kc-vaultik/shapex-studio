/**
 * OfficeScene - 3D Isometric Office Environment
 * The main 3D canvas containing the office zones and agents
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useGameStore, selectCurrentPhase } from '../../store/gameStore'
import OfficeZones from './OfficeZones'
import AgentAvatars from './AgentAvatars'
import Effects from './Effects'
import { GamePhase } from '../../store/gameStore'

// Zone Labels Component - Using placeholder spheres due to Text3D version compatibility
function ZoneLabels({ currentPhase }: { currentPhase: GamePhase }) {
  const zones = [
    { name: 'RESEARCH LAB', position: [-5, 3, 0] as [number, number, number], color: '#00F0FF', activePhase: 'RESEARCHING' as GamePhase },
    { name: 'IDEATION ARENA', position: [0, 3, 0] as [number, number, number], color: '#FFD600', activePhase: 'VALIDATING' as GamePhase },
    { name: 'STRATEGY ROOM', position: [5, 3, 0] as [number, number, number], color: '#BD00FF', activePhase: 'STRATEGIZING' as GamePhase }
  ]

  return (
    <>
      {zones.map((zone) => {
        const isActive = currentPhase === zone.activePhase
        return (
          <mesh key={zone.name} position={zone.position}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={isActive ? 2 : 0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        )
      })}
    </>
  )
}

export default function OfficeScene() {
  const currentPhase = useGameStore(selectCurrentPhase)

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#0B0C15]">
      <Canvas
        camera={{
          position: [10, 10, 10],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00F0FF" />

        {/* Environment */}
        <Environment preset="city" />

        {/* Office Zones (3 colored rooms) */}
        <OfficeZones currentPhase={currentPhase} />

        {/* Agent Avatars (3 AI agents) */}
        <AgentAvatars />

        {/* Zone Labels (3D Text) */}
        <ZoneLabels currentPhase={currentPhase} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>

        {/* Post-Processing Effects */}
        <Effects />

        {/* Camera Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={8}
          maxDistance={30}
        />
      </Canvas>

      {/* Phase Indicator (2D Overlay) */}
      <div className="absolute top-4 left-4 glass rounded-lg px-4 py-2 border border-white/10">
        <p className="text-xs text-slate-400 mb-1">CURRENT PHASE</p>
        <p className="text-lg font-bold text-white tracking-wide">{currentPhase}</p>
      </div>
    </div>
  )
}
