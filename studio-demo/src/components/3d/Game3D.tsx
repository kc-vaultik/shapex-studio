/**
 * Game3D - Main 3D Game Component
 * Integrates OfficeScene + GameHUD + Game Loop
 */

import { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import OfficeScene from './OfficeScene'
import GameHUD from './GameHUD'
import IdeaBoardModal from '../IdeaBoardModal'
import PortfolioModal from '../PortfolioModal'
import DecisionModal from '../DecisionModal'

export default function Game3D() {
  const initGame = useGameStore((state) => state.initGame)
  const tick = useGameStore((state) => state.tick)
  const isPlaying = useGameStore((state) => state.isPlaying)

  // Initialize game on mount
  useEffect(() => {
    initGame()
  }, [initGame])

  // Game loop (60 FPS)
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      tick()
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(interval)
  }, [tick, isPlaying])

  return (
    <div className="relative w-full h-screen bg-[#0B0C15] overflow-hidden">
      {/* 3D Office Scene */}
      <OfficeScene />

      {/* 2D HUD Overlay */}
      <GameHUD />

      {/* Modals */}
      <IdeaBoardModal />
      <PortfolioModal />
      <DecisionModal />

      {/* Loading/Startup Animation */}
      <StartupAnimation />
    </div>
  )
}

// Startup animation component
function StartupAnimation() {
  const isPlaying = useGameStore((state) => state.isPlaying)

  if (isPlaying) return null

  return (
    <div className="absolute inset-0 bg-[#0B0C15] flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold gradient-text mb-4">
          AI VENTURE STUDIO
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          Isometric Office Simulation
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-4 h-4 rounded-full bg-cyan-500 animate-pulse" />
          <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse delay-100" />
          <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse delay-200" />
        </div>
        <p className="text-sm text-slate-500 mt-6">
          Loading 3D environment...
        </p>
      </div>
    </div>
  )
}
