import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AgentCard from './components/AgentCard'
import NeuralStream from './components/NeuralStream'
import MetricCard from './components/MetricCard'
import ParticleBackground from './components/ParticleBackground'
import NeuralConnection from './components/NeuralConnection'
import { TrendingUp, Users, DollarSign } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  status: 'idle' | 'active' | 'waiting' | 'complete'
  progress: number
  currentAction: string
}

function App() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'researcher',
      name: 'Sarah',
      role: 'Researcher',
      avatar: '👩‍🔬',
      status: 'idle',
      progress: 0,
      currentAction: 'Ready to analyze...'
    },
    {
      id: 'validator',
      name: 'Alex',
      role: 'Validator',
      avatar: '👨‍💼',
      status: 'idle',
      progress: 0,
      currentAction: 'Ready to validate...'
    },
    {
      id: 'strategist',
      name: 'Marcus',
      role: 'Strategist',
      avatar: '👨‍🎓',
      status: 'idle',
      progress: 0,
      currentAction: 'Ready to strategize...'
    }
  ])

  const [streamMessages, setStreamMessages] = useState<string[]>([])
  const [metrics, setMetrics] = useState({
    tam: { value: '$0', change: 0, loading: true },
    competitors: { value: '0', change: 0, loading: true },
    funding: { value: '$0', change: 0, loading: true }
  })

  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)

  // Simulate autonomous workflow
  useEffect(() => {
    if (!isRunning) return

    const phases = [
      // Phase 1: Researcher starts
      {
        delay: 500,
        action: () => {
          updateAgent('researcher', 'active', 10, 'Opening Y Combinator...')
          addStreamMessage('💭 Sarah: Initializing market research protocol...')
        }
      },
      {
        delay: 1500,
        action: () => {
          updateAgent('researcher', 'active', 25, 'Scanning RFS database...')
          addStreamMessage('🔍 Sarah: Accessing Y Combinator RFS database...')
        }
      },
      {
        delay: 2500,
        action: () => {
          updateAgent('researcher', 'active', 40, 'Found 47 RFS posts')
          addStreamMessage('⚡ Sarah: Pattern detected → AI dev tools +200%')
          updateMetrics('tam', '$12B', 15)
        }
      },
      {
        delay: 3500,
        action: () => {
          updateAgent('researcher', 'active', 60, 'Analyzing market size...')
          addStreamMessage('🧠 Sarah: Cross-referencing with 847 startups...')
          updateMetrics('competitors', '847', 23)
        }
      },
      {
        delay: 4500,
        action: () => {
          updateAgent('researcher', 'active', 80, 'Running TAM analysis...')
          addStreamMessage('📊 Sarah: TAM analysis: $45B market opportunity')
          updateMetrics('tam', '$45B', 200)
        }
      },
      {
        delay: 5500,
        action: () => {
          updateAgent('researcher', 'active', 95, 'Preparing report...')
          addStreamMessage('✅ Sarah: Market research complete. Passing to Alex...')
        }
      },
      {
        delay: 6500,
        action: () => {
          updateAgent('researcher', 'complete', 100, 'Research complete')
          updateAgent('validator', 'active', 10, 'Receiving data...')
          addStreamMessage('💭 Alex: Initiating validation protocol...')
        }
      },
      // Phase 2: Validator works
      {
        delay: 7500,
        action: () => {
          updateAgent('validator', 'active', 30, 'Deploying survey...')
          addStreamMessage('📋 Alex: Creating SurveyMonkey validation...')
        }
      },
      {
        delay: 8500,
        action: () => {
          updateAgent('validator', 'active', 50, 'Analyzing responses...')
          addStreamMessage('🎯 Alex: 127 responses received in 2 minutes')
          updateMetrics('funding', '$2.3B', 180)
        }
      },
      {
        delay: 9500,
        action: () => {
          updateAgent('validator', 'active', 70, 'Running feasibility...')
          addStreamMessage('🔬 Alex: Feasibility score: 7.5/10')
        }
      },
      {
        delay: 10500,
        action: () => {
          updateAgent('validator', 'active', 90, 'Generating report...')
          addStreamMessage('✅ Alex: Validation complete. Passing to Marcus...')
        }
      },
      {
        delay: 11500,
        action: () => {
          updateAgent('validator', 'complete', 100, 'Validation complete')
          updateAgent('strategist', 'active', 15, 'Synthesizing insights...')
          addStreamMessage('💭 Marcus: Analyzing strategic opportunities...')
        }
      },
      // Phase 3: Strategist works
      {
        delay: 12500,
        action: () => {
          updateAgent('strategist', 'active', 35, 'Building business model...')
          addStreamMessage('💡 Marcus: Crafting go-to-market strategy...')
        }
      },
      {
        delay: 13500,
        action: () => {
          updateAgent('strategist', 'active', 60, 'Financial projections...')
          addStreamMessage('📈 Marcus: 12-month projection: $2.5M ARR')
        }
      },
      {
        delay: 14500,
        action: () => {
          updateAgent('strategist', 'active', 85, 'Competitive analysis...')
          addStreamMessage('🎯 Marcus: Recommendation: BUILD with pivot to enterprise')
        }
      },
      {
        delay: 15500,
        action: () => {
          updateAgent('strategist', 'complete', 100, 'Strategy complete')
          addStreamMessage('🎉 Complete! Blueprint generated successfully.')
        }
      }
    ]

    phases.forEach((phase, index) => {
      setTimeout(() => {
        phase.action()
        setCurrentPhase(index + 1)
      }, phase.delay)
    })

    // Auto-complete after all phases
    setTimeout(() => {
      setIsRunning(false)
    }, 16000)

  }, [isRunning])

  const updateAgent = (id: string, status: Agent['status'], progress: number, action: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === id ? { ...agent, status, progress, currentAction: action } : agent
    ))
  }

  const addStreamMessage = (message: string) => {
    setStreamMessages(prev => [...prev, message])
  }

  const updateMetrics = (key: string, value: string, change: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: { value, change, loading: false }
    }))
  }

  const startDemo = () => {
    setIsRunning(true)
    setStreamMessages([])
    setCurrentPhase(0)

    // Reset all agents
    setAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'idle',
      progress: 0,
      currentAction: `Ready to ${agent.role.toLowerCase()}...`
    })))

    // Reset metrics
    setMetrics({
      tam: { value: '$0', change: 0, loading: true },
      competitors: { value: '0', change: 0, loading: true },
      funding: { value: '$0', change: 0, loading: true }
    })
  }

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      <ParticleBackground isActive={isRunning} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold mb-4">
          <span className="gradient-text">⚡ SHAPEX AUTONOMOUS STUDIO ⚡</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Watch AI agents autonomously research, validate, and strategize in real-time
        </p>

        {!isRunning && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startDemo}
            className="glass px-8 py-4 rounded-full text-lg font-semibold neural-glow-strong hover:neural-glow transition-all"
          >
            🚀 Start Autonomous Analysis
          </motion.button>
        )}

        {isRunning && (
          <div className="glass px-6 py-3 rounded-full inline-block">
            <span className="text-neural-cyan">⚡ Agents Working...</span>
            <span className="ml-3 text-gray-400">Phase {currentPhase}/16</span>
          </div>
        )}
      </motion.div>

      {/* Agent Network */}
      <div className="max-w-7xl mx-auto mb-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <AgentCard agent={agents[0]} />
          <AgentCard agent={agents[1]} />
          <AgentCard agent={agents[2]} />
        </div>

        {/* Neural Connections */}
        <NeuralConnection
          fromAgent={agents[0]}
          toAgent={agents[1]}
          isActive={agents[0].status === 'complete' && agents[1].status === 'active'}
        />
        <NeuralConnection
          fromAgent={agents[1]}
          toAgent={agents[2]}
          isActive={agents[1].status === 'complete' && agents[2].status === 'active'}
        />
      </div>

      {/* Live Neural Stream */}
      <NeuralStream messages={streamMessages} />

      {/* Metrics Dashboard */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <MetricCard
          icon={<TrendingUp size={24} />}
          label="Total Addressable Market"
          value={metrics.tam.value}
          change={metrics.tam.change}
          loading={metrics.tam.loading}
        />
        <MetricCard
          icon={<Users size={24} />}
          label="Active Competitors"
          value={metrics.competitors.value}
          change={metrics.competitors.change}
          loading={metrics.competitors.loading}
        />
        <MetricCard
          icon={<DollarSign size={24} />}
          label="Recent Funding (Q1 2026)"
          value={metrics.funding.value}
          change={metrics.funding.change}
          loading={metrics.funding.loading}
        />
      </div>

      {/* Footer */}
      <div className="text-center mt-16 text-gray-500 text-sm">
        <p>✨ Powered by Autonomous AI Agents • Real-time Market Intelligence</p>
      </div>
    </div>
  )
}

export default App
