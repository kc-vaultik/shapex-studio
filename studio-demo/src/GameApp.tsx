import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OfficeView from './components/game/OfficeView'
import IdeaBoard from './components/game/IdeaBoard'
import ResourceBar from './components/game/ResourceBar'
import DecisionModal from './components/game/DecisionModal'
import CompanyPortfolio from './components/game/CompanyPortfolio'
import AgentUpgrade from './components/game/AgentUpgrade'
import LiveAgentShowcase from './components/game/LiveAgentShowcase'
import { Building2, Sparkles, TrendingUp, Users, Play } from 'lucide-react'
import { useGameStore } from './store/gameStore'
import { useRealAnalysis } from './hooks/useRealAnalysis'

export interface GameState {
  money: number
  reputation: number
  level: number
  companies: Company[]
  activeAnalysis: Analysis | null
  decisions: Decision[]
}

export interface Company {
  id: string
  name: string
  status: 'analyzing' | 'building' | 'launched' | 'failed'
  revenue: number
  stage: string
}

export interface Analysis {
  ideaId: string
  ideaTitle: string
  stage: 'research' | 'validation' | 'strategy' | 'decision'
  progress: number
}

export interface Decision {
  id: string
  title: string
  description: string
  options: DecisionOption[]
}

export interface DecisionOption {
  id: string
  label: string
  impact: string
  cost: number
}

function GameApp() {
  // Use Zustand store
  const {
    money,
    reputation,
    level,
    companies,
    currentIdea,
    currentAnalysis,
    showDecisionModal,
    startAnalysis,
    makeDecision,
    loadNextIdea,
    availableIdeas
  } = useGameStore()

  // Use REAL analysis hook for 3-agent workflow (connected to backend)
  useRealAnalysis()

  const [showIdeaBoard, setShowIdeaBoard] = useState(true)
  const [tutorial, setTutorial] = useState(true)
  const [showLiveShowcase, setShowLiveShowcase] = useState(true) // Auto-show on load

  // Load first idea on mount
  useEffect(() => {
    if (!currentIdea && availableIdeas && availableIdeas.length > 0) {
      loadNextIdea()
    }
  }, [])

  // Convert store ideas to display format for IdeaBoard
  const ycIdeas = (availableIdeas || []).map(idea => ({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    cost: 5000, // Analysis cost
    estimatedRevenue: 50000,
    difficulty: 'Medium',
    market: '$1B+'
  }))

  const handleStartAnalysis = (idea: typeof ycIdeas[0]) => {
    const storeIdea = availableIdeas?.find(i => i.id === idea.id)
    if (!storeIdea) return

    if (money < idea.cost) {
      alert('Not enough budget! Complete projects to earn more.')
      return
    }

    startAnalysis(storeIdea)
    setShowIdeaBoard(false)
  }

  const handleDecision = (optionId: string) => {
    if (optionId === 'build') {
      makeDecision('BUILD', 50000)
    } else if (optionId === 'pivot') {
      makeDecision('PIVOT', 25000)
    } else {
      makeDecision('PASS')
    }

    // Reopen idea board after decision
    setTimeout(() => setShowIdeaBoard(true), 2000)
  }

  // Mock decision for DecisionModal component compatibility
  const currentDecision = showDecisionModal && currentAnalysis ? {
    id: currentAnalysis.id,
    title: `Decision: ${currentIdea?.title}`,
    description: 'Our AI agents have analyzed this idea. What do you want to do?',
    options: [
      {
        id: 'build',
        label: '🚀 BUILD IT',
        impact: `Invest $50,000 to launch. Potential: $15,000/mo`,
        cost: 50000
      },
      {
        id: 'pivot',
        label: '🔄 PIVOT',
        impact: 'Adjust strategy based on insights. Cost: $25,000',
        cost: 25000
      },
      {
        id: 'pass',
        label: '❌ PASS',
        impact: 'Skip this idea, save resources',
        cost: 0
      }
    ]
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-dark via-neural-purple to-neural-dark text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              🎮 AI VENTURE STUDIO GAME
            </h1>
            <p className="text-gray-400">Build companies with autonomous AI agents</p>
          </div>

          <ResourceBar gameState={{ money, reputation, level, companies, activeAnalysis: currentAnalysis, decisions: [] }} />
        </div>
      </div>

      {/* Tutorial */}
      <AnimatePresence>
        {tutorial && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto mb-4"
          >
            <div className="glass rounded-lg p-4 border-2 border-neural-cyan">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">🎯 How to Play</h3>
                  <ul className="text-sm space-y-1 text-gray-300">
                    <li>1️⃣ Browse Y Combinator ideas and pick one to analyze</li>
                    <li>2️⃣ Watch your AI agents work in the office</li>
                    <li>3️⃣ Make decisions: BUILD, PIVOT, or PASS</li>
                    <li>4️⃣ Build companies, earn money, level up!</li>
                  </ul>
                </div>
                <button
                  onClick={() => setTutorial(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Agent Showcase - Priority 0: Auto-show on page load */}
      <AnimatePresence>
        {showLiveShowcase && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-slate-900 rounded-3xl shadow-2xl border-2 border-cyan-500/50 max-w-6xl w-full max-h-[90vh] overflow-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold gradient-text mb-2">
                      🤖 Watch AI Agents Work in Real-Time
                    </h2>
                    <p className="text-slate-400">
                      See how our autonomous agents analyze startup ideas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLiveShowcase(false)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Building
                  </button>
                </div>
              </div>

              {/* Live Showcase */}
              <LiveAgentShowcase />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Office View */}
        <div className="lg:col-span-2">
          <OfficeView
            activeAnalysis={currentAnalysis as any}
            companies={companies}
          />
        </div>

        {/* Right: Idea Board / Portfolio */}
        <div className="space-y-4">
          {showIdeaBoard && !currentAnalysis && (
            <IdeaBoard
              ideas={ycIdeas}
              onSelectIdea={handleStartAnalysis}
              playerMoney={money}
            />
          )}

          <CompanyPortfolio companies={companies} />

          {level > 1 && <AgentUpgrade />}
        </div>
      </div>

      {/* Decision Modal */}
      <AnimatePresence>
        {showDecisionModal && currentDecision && (
          <DecisionModal
            decision={currentDecision}
            onChoose={handleDecision}
            playerMoney={money}
          />
        )}
      </AnimatePresence>

      {/* Bottom Stats */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.05 }} className="glass rounded-lg p-4 text-center">
          <Building2 className="mx-auto mb-2 text-neural-cyan" size={24} />
          <div className="text-2xl font-bold">{companies.length}</div>
          <div className="text-xs text-gray-400">Companies</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="glass rounded-lg p-4 text-center">
          <TrendingUp className="mx-auto mb-2 text-green-400" size={24} />
          <div className="text-2xl font-bold">
            ${companies.reduce((sum, c) => sum + c.revenue, 0)}
          </div>
          <div className="text-xs text-gray-400">Monthly Revenue</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="glass rounded-lg p-4 text-center">
          <Sparkles className="mx-auto mb-2 text-yellow-400" size={24} />
          <div className="text-2xl font-bold">{reputation}</div>
          <div className="text-xs text-gray-400">Reputation</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="glass rounded-lg p-4 text-center">
          <Users className="mx-auto mb-2 text-purple-400" size={24} />
          <div className="text-2xl font-bold">Level {level}</div>
          <div className="text-xs text-gray-400">Venture Level</div>
        </motion.div>
      </div>
    </div>
  )
}

export default GameApp
