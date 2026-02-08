/**
 * IdeaBoardModal - Grid of startup ideas to analyze
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { X, TrendingUp, DollarSign, Target } from 'lucide-react'

export default function IdeaBoardModal() {
  const showIdeaBoard = useGameStore((state) => state.showIdeaBoard)
  const availableIdeas = useGameStore((state) => state.availableIdeas)
  const resources = useGameStore((state) => state.resources)
  const selectIdea = useGameStore((state) => state.selectIdea)
  const toggleIdeaBoard = useGameStore((state) => state.toggleIdeaBoard)

  if (!showIdeaBoard) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={toggleIdeaBoard}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass rounded-3xl border-2 border-cyan-500/30 max-w-5xl w-full max-h-[80vh] overflow-auto p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                💡 Startup Ideas
              </h2>
              <p className="text-slate-400">
                Select an idea to analyze with AI agents
              </p>
            </div>
            <button
              onClick={toggleIdeaBoard}
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableIdeas.map((idea) => {
              const canAfford = resources.money >= idea.analysisCost

              return (
                <motion.button
                  key={idea.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (canAfford) {
                      selectIdea(idea)
                    }
                  }}
                  disabled={!canAfford}
                  className={`glass rounded-xl p-6 border-2 text-left transition-all ${
                    canAfford
                      ? 'border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/5 cursor-pointer'
                      : 'border-red-500/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      idea.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
                      idea.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      idea.difficulty === 'HARD' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {idea.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{idea.source.replace('_', ' ')}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {idea.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-slate-700/30 text-slate-400 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Market
                      </span>
                      <span className="text-white font-semibold">{idea.marketSize}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Revenue
                      </span>
                      <span className="text-green-400 font-semibold">
                        ${idea.estimatedRevenue.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Analysis
                      </span>
                      <span className={`font-semibold ${
                        canAfford ? 'text-cyan-400' : 'text-red-400'
                      }`}>
                        ${idea.analysisCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {!canAfford && (
                    <div className="mt-4 text-center text-xs text-red-400 font-semibold">
                      ⚠️ Insufficient funds
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
