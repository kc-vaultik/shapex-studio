/**
 * GameHUD - Heads-Up Display (2D Overlay)
 * Shows resources, game controls, and UI overlays
 */

import { useGameStore, selectResources, selectCurrentPhase, selectStats } from '../../store/gameStore'
import { DollarSign, Star, TrendingUp, Zap, Play, Pause, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GameHUD() {
  const resources = useGameStore(selectResources)
  const currentPhase = useGameStore(selectCurrentPhase)
  const stats = useGameStore(selectStats)
  const gameSpeed = useGameStore((state) => state.gameSpeed)
  const setGameSpeed = useGameStore((state) => state.setGameSpeed)
  const toggleIdeaBoard = useGameStore((state) => state.toggleIdeaBoard)
  const togglePortfolio = useGameStore((state) => state.togglePortfolio)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Left - Resources */}
      <div className="absolute top-4 left-4 space-y-3 pointer-events-auto">
        {/* Money */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-xl px-4 py-3 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Capital</p>
              <p className="text-xl font-bold text-white">
                ${resources.money.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reputation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl px-4 py-3 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Reputation</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    style={{ width: `${resources.reputation}%` }}
                  />
                </div>
                <p className="text-sm font-bold text-white">{resources.reputation}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl px-4 py-3 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Level</p>
              <p className="text-xl font-bold text-white">
                {resources.level}
              </p>
              <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(resources.experience / (resources.level * 1000)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Right - Active Task & Controls */}
      <div className="absolute top-4 right-4 space-y-3 pointer-events-auto">
        {/* Active Phase Indicator */}
        <AnimatePresence>
          {currentPhase !== 'IDLE' && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`glass rounded-xl px-4 py-3 border-2 backdrop-blur-xl ${
                currentPhase === 'RESEARCHING' ? 'border-cyan-500' :
                currentPhase === 'VALIDATING' ? 'border-yellow-500' :
                currentPhase === 'STRATEGIZING' ? 'border-purple-500' :
                currentPhase === 'DECISION' ? 'border-green-500' :
                'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className={`w-6 h-6 ${
                    currentPhase === 'RESEARCHING' ? 'text-cyan-400' :
                    currentPhase === 'VALIDATING' ? 'text-yellow-400' :
                    currentPhase === 'STRATEGIZING' ? 'text-purple-400' :
                    'text-green-400'
                  }`} />
                </motion.div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Active</p>
                  <p className="text-lg font-bold text-white">{currentPhase}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Speed Control */}
        <div className="glass rounded-xl px-3 py-2 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setGameSpeed(speed as 1 | 2 | 4)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    gameSpeed === speed
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={toggleIdeaBoard}
            className="glass rounded-xl px-4 py-2 border border-cyan-500/30 backdrop-blur-xl text-cyan-400 font-semibold text-sm hover:bg-cyan-500/10 transition-all"
          >
            IDEAS
          </button>
          <button
            onClick={togglePortfolio}
            className="glass rounded-xl px-4 py-2 border border-purple-500/30 backdrop-blur-xl text-purple-400 font-semibold text-sm hover:bg-purple-500/10 transition-all"
          >
            PORTFOLIO
          </button>
        </div>
      </div>

      {/* Bottom Center - Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto"
      >
        <div className="glass rounded-full px-6 py-3 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-slate-400 text-xs">COMPANIES</p>
              <p className="text-white font-bold text-lg">{stats.companiesLaunched}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-slate-400 text-xs">REVENUE</p>
              <p className="text-green-400 font-bold text-lg">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-slate-400 text-xs">IDEAS ANALYZED</p>
              <p className="text-cyan-400 font-bold text-lg">{stats.ideasAnalyzed}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-slate-400 text-xs">PLAYTIME</p>
              <p className="text-purple-400 font-bold text-lg">
                {Math.floor(stats.timePlayedSeconds / 60)}m
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Phase-specific hints */}
      <AnimatePresence>
        {currentPhase === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div className="glass rounded-xl px-6 py-3 border border-cyan-500/30 backdrop-blur-xl">
              <p className="text-cyan-400 text-sm font-semibold">
                💡 Click "IDEAS" to analyze a startup concept
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
