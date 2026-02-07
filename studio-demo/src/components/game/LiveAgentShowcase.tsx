/**
 * Live Agent Showcase - Priority 0
 * Shows AI agents visibly working immediately on page load
 * Creates "wow" moment with real-time animations and gamification
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, Target, Zap, Sparkles, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Agent {
  id: 'researcher' | 'validator' | 'strategist'
  name: string
  icon: typeof Brain
  color: string
  glowColor: string
  status: 'idle' | 'thinking' | 'working' | 'complete'
  progress: number
  currentThought: string
  outputSnippets: string[]
}

export default function LiveAgentShowcase() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'researcher',
      name: 'Researcher',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
      status: 'working',
      progress: 0,
      currentThought: 'Analyzing market trends...',
      outputSnippets: []
    },
    {
      id: 'validator',
      name: 'Validator',
      icon: CheckCircle2,
      color: 'from-yellow-500 to-orange-500',
      glowColor: 'shadow-yellow-500/50',
      status: 'idle',
      progress: 0,
      currentThought: 'Waiting for research...',
      outputSnippets: []
    },
    {
      id: 'strategist',
      name: 'Strategist',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      glowColor: 'shadow-green-500/50',
      status: 'idle',
      progress: 0,
      currentThought: 'Standing by...',
      outputSnippets: []
    }
  ])

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; agentId: string }>>([])

  // Simulate agent activity with realistic timing
  useEffect(() => {
    const simulateWork = async () => {
      // Researcher phase (0-10 seconds)
      await simulateAgent('researcher', [
        'Scanning YCombinator RFS trends...',
        'Analyzing 2,847 startup ideas...',
        'Identifying market gaps...',
        'Evaluating competition landscape...',
        'Compiling research findings...'
      ], 10000)

      // Validator phase (10-18 seconds)
      await simulateAgent('validator', [
        'Checking technical feasibility...',
        'Validating market assumptions...',
        'Assessing resource requirements...',
        'Calculating risk factors...',
        'Generating feasibility score...'
      ], 8000)

      // Strategist phase (18-25 seconds)
      await simulateAgent('strategist', [
        'Designing go-to-market strategy...',
        'Planning revenue model...',
        'Identifying key milestones...',
        'Calculating financial projections...',
        'Finalizing business blueprint...'
      ], 7000)

      // All complete - show success state
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'complete',
        progress: 100,
        currentThought: '✓ Complete!'
      })))
    }

    simulateWork()

    // Particle generation for active agents
    const particleInterval = setInterval(() => {
      setParticles(prev => {
        const activeAgent = agents.find(a => a.status === 'working')
        if (!activeAgent) return prev

        const newParticles = [...prev, {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          agentId: activeAgent.id
        }]

        // Keep only last 20 particles
        return newParticles.slice(-20)
      })
    }, 200)

    return () => clearInterval(particleInterval)
  }, [])

  const simulateAgent = async (agentId: 'researcher' | 'validator' | 'strategist', thoughts: string[], duration: number) => {
    return new Promise<void>((resolve) => {
      // Set agent to working
      setAgents(prev => prev.map(agent =>
        agent.id === agentId
          ? { ...agent, status: 'working' as const, progress: 0 }
          : agent
      ))

      let currentProgress = 0
      const steps = thoughts.length
      const stepDuration = duration / steps

      const interval = setInterval(() => {
        currentProgress += 100 / steps

        if (currentProgress >= 100) {
          clearInterval(interval)
          setAgents(prev => prev.map(agent =>
            agent.id === agentId
              ? { ...agent, status: 'complete' as const, progress: 100, currentThought: '✓ Complete!' }
              : agent
          ))
          resolve()
        } else {
          const thoughtIndex = Math.floor((currentProgress / 100) * thoughts.length)
          setAgents(prev => prev.map(agent =>
            agent.id === agentId
              ? {
                ...agent,
                progress: currentProgress,
                currentThought: thoughts[thoughtIndex] || thoughts[thoughts.length - 1],
                outputSnippets: [...agent.outputSnippets, thoughts[thoughtIndex]].slice(-3)
              }
              : agent
          ))
        }
      }, stepDuration)
    })
  }

  return (
    <div className="relative w-full h-full">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0, x: `${particle.x}%`, y: `${particle.y}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: `${particle.y - 20}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative"
          >
            {/* Agent Card */}
            <div
              className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 ${
                agent.status === 'working'
                  ? `border-cyan-500 ${agent.glowColor} shadow-2xl scale-105`
                  : agent.status === 'complete'
                    ? 'border-green-500 shadow-green-500/50 shadow-xl'
                    : 'border-slate-700'
              }`}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: agent.status === 'working' ? [1, 1.2, 1] : 1,
                      rotate: agent.status === 'working' ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                      duration: 2,
                      repeat: agent.status === 'working' ? Infinity : 0
                    }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center`}
                  >
                    <agent.icon className="w-6 h-6 text-white" />
                  </motion.div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400">
                      {agent.status === 'idle' && 'Standby'}
                      {agent.status === 'working' && 'Processing...'}
                      {agent.status === 'complete' && 'Done'}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <motion.div
                  animate={{
                    scale: agent.status === 'working' ? [1, 1.5, 1] : 1,
                    opacity: agent.status === 'working' ? [0.5, 1, 0.5] : 1
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: agent.status === 'working' ? Infinity : 0
                  }}
                  className={`w-3 h-3 rounded-full ${
                    agent.status === 'working'
                      ? 'bg-cyan-400'
                      : agent.status === 'complete'
                        ? 'bg-green-400'
                        : 'bg-slate-600'
                  }`}
                />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${agent.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-right">{Math.round(agent.progress)}%</p>
              </div>

              {/* Current Thought */}
              <motion.div
                key={agent.currentThought}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <p className="text-sm text-cyan-400 font-mono flex items-center gap-2">
                  {agent.status === 'working' && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="w-3 h-3" />
                    </motion.span>
                  )}
                  {agent.currentThought}
                </p>
              </motion.div>

              {/* Output Snippets */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {agent.outputSnippets.slice(-2).map((snippet, idx) => (
                    <motion.div
                      key={snippet}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-xs text-slate-400 font-mono p-2 bg-slate-800/30 rounded border-l-2 border-cyan-500/30"
                    >
                      → {snippet}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Completion sparkles */}
              {agent.status === 'complete' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-green-400" />
                </motion.div>
              )}
            </div>

            {/* Connection line to next agent */}
            {index < agents.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Live Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 mx-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30"
      >
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-white">
              {agents.filter(a => a.status === 'complete').length}/3
            </p>
            <p className="text-xs text-slate-400">Agents Complete</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-400">
              {Math.round(agents.reduce((sum, a) => sum + a.progress, 0) / agents.length)}%
            </p>
            <p className="text-xs text-slate-400">Overall Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5" />
              Live
            </p>
            <p className="text-xs text-slate-400">Real-time Analysis</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
