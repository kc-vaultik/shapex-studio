/**
 * PortfolioModal - View launched companies
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, selectPortfolio } from '../store/gameStore'
import { X, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'

export default function PortfolioModal() {
  const showPortfolio = useGameStore((state) => state.showPortfolio)
  const portfolio = useGameStore(selectPortfolio)
  const togglePortfolio = useGameStore((state) => state.togglePortfolio)

  if (!showPortfolio) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={togglePortfolio}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass rounded-3xl border-2 border-purple-500/30 max-w-4xl w-full max-h-[80vh] overflow-auto p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                🏢 Portfolio
              </h2>
              <p className="text-slate-400">
                {portfolio.length} {portfolio.length === 1 ? 'company' : 'companies'} launched
              </p>
            </div>
            <button
              onClick={togglePortfolio}
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Portfolio Grid */}
          {portfolio.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No companies yet</p>
              <p className="text-slate-500 text-sm">Analyze ideas and build companies to grow your portfolio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolio.map((company) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-xl p-6 border border-purple-500/20"
                >
                  {/* Company Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {company.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        company.stage === 'PRE_SEED' ? 'bg-blue-500/20 text-blue-400' :
                        company.stage === 'SEED' ? 'bg-green-500/20 text-green-400' :
                        company.stage === 'SERIES_A' ? 'bg-purple-500/20 text-purple-400' :
                        company.stage === 'GROWTH' ? 'bg-pink-500/20 text-pink-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {company.stage.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Valuation</p>
                      <p className="text-lg font-bold text-white">
                        ${company.valuation.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <p className="text-xs text-slate-400">Monthly Revenue</p>
                      </div>
                      <p className="text-lg font-bold text-white">
                        ${company.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>

                    <div className="glass rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs text-slate-400">Total Revenue</p>
                      </div>
                      <p className="text-lg font-bold text-white">
                        ${company.totalRevenue.toLocaleString()}
                      </p>
                    </div>

                    <div className="glass rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-400" />
                        <p className="text-xs text-slate-400">Employees</p>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {company.employees}
                      </p>
                    </div>

                    <div className="glass rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <p className="text-xs text-slate-400">Founded</p>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {new Date(company.foundedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
