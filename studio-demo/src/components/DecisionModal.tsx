/**
 * DecisionModal - BUILD / PIVOT / PASS decision after analysis
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Rocket, RotateCcw, X, TrendingUp, AlertTriangle, Target } from 'lucide-react'

export default function DecisionModal() {
  const showDecisionModal = useGameStore((state) => state.showDecisionModal)
  const currentAnalysis = useGameStore((state) => state.currentAnalysis)
  const currentIdea = useGameStore((state) => state.currentIdea)
  const resources = useGameStore((state) => state.resources)
  const buildCompany = useGameStore((state) => state.buildCompany)
  const pivotIdea = useGameStore((state) => state.pivotIdea)
  const passIdea = useGameStore((state) => state.passIdea)

  if (!showDecisionModal || !currentAnalysis || !currentIdea) return null

  const overallScore = currentAnalysis.overallScore || 0
  const canBuild = resources.money >= 50000
  const canPivot = resources.money >= 25000

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass rounded-3xl border-2 border-green-500/30 max-w-3xl w-full p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              ✅ Analysis Complete!
            </h2>
            <p className="text-xl text-slate-300 mb-2">{currentIdea.title}</p>
            <p className="text-slate-400">{currentIdea.description}</p>
          </div>

          {/* Overall Score */}
          <div className="mb-8">
            <div className="glass rounded-2xl p-6 border-2 border-cyan-500/30 text-center">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Overall Score</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {overallScore}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    {overallScore >= 80 ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-green-400 font-semibold">Excellent</span>
                      </>
                    ) : overallScore >= 60 ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-yellow-400 font-semibold">Good</span>
                      </>
                    ) : overallScore >= 40 ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-orange-400 font-semibold">Moderate</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-red-400 font-semibold">Risky</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Based on AI agent analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Results */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Research */}
            <div className="glass rounded-xl p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <p className="text-xs text-slate-400 uppercase">Research</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {currentAnalysis.research?.score || 0}
              </p>
            </div>

            {/* Validation */}
            <div className="glass rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-slate-400 uppercase">Validation</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {currentAnalysis.validation?.score || 0}
              </p>
            </div>

            {/* Strategy */}
            <div className="glass rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-slate-400 uppercase">Strategy</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {currentAnalysis.strategy?.score || 0}
              </p>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="grid grid-cols-3 gap-4">
            {/* BUILD */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={buildCompany}
              disabled={!canBuild}
              className={`glass rounded-2xl p-6 border-2 transition-all ${
                canBuild
                  ? 'border-green-500 hover:bg-green-500/10 cursor-pointer'
                  : 'border-red-500/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <Rocket className={`w-8 h-8 mx-auto mb-3 ${
                canBuild ? 'text-green-400' : 'text-red-400'
              }`} />
              <h3 className="text-lg font-bold text-white mb-2">BUILD</h3>
              <p className="text-sm text-slate-400 mb-3">
                Launch this company
              </p>
              <p className={`text-xs font-bold ${
                canBuild ? 'text-green-400' : 'text-red-400'
              }`}>
                $50,000
              </p>
              {!canBuild && (
                <p className="text-xs text-red-400 mt-2">Insufficient funds</p>
              )}
            </motion.button>

            {/* PIVOT */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pivotIdea}
              disabled={!canPivot}
              className={`glass rounded-2xl p-6 border-2 transition-all ${
                canPivot
                  ? 'border-yellow-500 hover:bg-yellow-500/10 cursor-pointer'
                  : 'border-red-500/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <RotateCcw className={`w-8 h-8 mx-auto mb-3 ${
                canPivot ? 'text-yellow-400' : 'text-red-400'
              }`} />
              <h3 className="text-lg font-bold text-white mb-2">PIVOT</h3>
              <p className="text-sm text-slate-400 mb-3">
                Adjust strategy
              </p>
              <p className={`text-xs font-bold ${
                canPivot ? 'text-yellow-400' : 'text-red-400'
              }`}>
                $25,000
              </p>
              {!canPivot && (
                <p className="text-xs text-red-400 mt-2">Insufficient funds</p>
              )}
            </motion.button>

            {/* PASS */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={passIdea}
              className="glass rounded-2xl p-6 border-2 border-slate-500 hover:bg-slate-500/10 cursor-pointer transition-all"
            >
              <X className="w-8 h-8 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-bold text-white mb-2">PASS</h3>
              <p className="text-sm text-slate-400 mb-3">
                Skip this idea
              </p>
              <p className="text-xs font-bold text-slate-400">
                Free
              </p>
            </motion.button>
          </div>

          {/* Recommendation */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {overallScore >= 70 ? (
                <>✅ <span className="text-green-400 font-semibold">Recommended:</span> Strong opportunity - BUILD!</>
              ) : overallScore >= 50 ? (
                <>⚠️ <span className="text-yellow-400 font-semibold">Caution:</span> Consider PIVOT for better fit</>
              ) : (
                <>❌ <span className="text-red-400 font-semibold">High Risk:</span> Recommend PASS</>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
