/**
 * Live Agent Showcase - Priority 0
 * Shows Portfolio Manager orchestrating AI agents with visual task assignment
 * Hero banner layout with central narrative flow
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle2, Target, Zap, Sparkles, TrendingUp, Briefcase, ArrowDown, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Agent {
  id: 'manager' | 'researcher' | 'validator' | 'strategist'
  name: string
  icon: typeof Brain
  color: string
  glowColor: string
  status: 'idle' | 'thinking' | 'working' | 'complete' | 'deciding'
  progress: number
  currentThought: string
  outputSnippets: string[]
  role: string
}

export default function LiveAgentShowcase() {
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'manager',
      name: 'Portfolio Manager',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/50',
      status: 'deciding',
      progress: 0,
      currentThought: 'Reviewing startup ideas...',
      outputSnippets: [],
      role: 'Orchestrator'
    },
    {
      id: 'researcher',
      name: 'Researcher',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
      status: 'idle',
      progress: 0,
      currentThought: 'Awaiting assignment...',
      outputSnippets: [],
      role: 'Market Analysis'
    },
    {
      id: 'validator',
      name: 'Validator',
      icon: CheckCircle2,
      color: 'from-yellow-500 to-orange-500',
      glowColor: 'shadow-yellow-500/50',
      status: 'idle',
      progress: 0,
      currentThought: 'Awaiting assignment...',
      outputSnippets: [],
      role: 'Feasibility Check'
    },
    {
      id: 'strategist',
      name: 'Strategist',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      glowColor: 'shadow-green-500/50',
      status: 'idle',
      progress: 0,
      currentThought: 'Awaiting assignment...',
      outputSnippets: [],
      role: 'Strategy Planning'
    }
  ])

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; agentId: string }>>([])

  // Simulate Portfolio Manager orchestrating the team
  useEffect(() => {
    const orchestrateWorkflow = async () => {
      // Phase 1: Portfolio Manager reviews ideas (0-8 seconds)
      await simulateAgent('manager', [
        'Reviewing Y Combinator RFS opportunities...',
        'Analyzing Product Hunt trending products...',
        'Scanning A16Z portfolio patterns...',
        'Evaluating 2,847 potential ideas...',
        'Scoring feasibility and market fit...',
        'Decision: AI Code Review Platform selected!'
      ], 8000)

      // Show selected idea
      setSelectedIdea('AI Code Review Platform')

      // Phase 2: Manager assigns tasks (visual pause for 2 seconds)
      setAgents(prev => prev.map(agent =>
        agent.id === 'manager'
          ? { ...agent, status: 'working' as const, currentThought: 'Assigning tasks to team...' }
          : agent
      ))
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Phase 3: All agents work in parallel (10-15 seconds each)
      const agentPromises = [
        simulateAgent('researcher', [
          '📊 Analyzing code review market...',
          '🔍 Researching competitor tools...',
          '📈 Identifying market gaps...',
          '💡 Finding unique value props...',
          '✅ Research complete!'
        ], 12000),

        simulateAgent('validator', [
          '🔧 Checking technical feasibility...',
          '⚡ Validating AI model requirements...',
          '💰 Assessing cost structure...',
          '⚠️ Calculating risk factors...',
          '✅ Validation complete!'
        ], 10000),

        simulateAgent('strategist', [
          '🎯 Designing go-to-market plan...',
          '💵 Planning revenue model...',
          '🚀 Identifying key milestones...',
          '📊 Creating financial projections...',
          '✅ Strategy complete!'
        ], 11000)
      ]

      // Wait for all agents to complete
      await Promise.all(agentPromises)

      // Phase 4: Manager reviews results
      setAgents(prev => prev.map(agent =>
        agent.id === 'manager'
          ? { ...agent, status: 'working' as const, progress: 80, currentThought: '🎉 Reviewing team results...' }
          : agent
      ))
      await new Promise(resolve => setTimeout(resolve, 3000))

      // All complete!
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'complete',
        progress: 100,
        currentThought: '✓ Analysis Complete!'
      })))
    }

    orchestrateWorkflow()

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

  const manager = agents.find(a => a.id === 'manager')!
  const teamAgents = agents.filter(a => a.id !== 'manager')

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-center py-12 px-6">
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

      {/* Hero: Portfolio Manager (Center Top) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8"
      >
        {/* Manager Card - Extra Large */}
        <div
          className={`relative bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border-4 transition-all duration-500 ${
            manager.status === 'working' || manager.status === 'deciding'
              ? `border-purple-500 ${manager.glowColor} shadow-2xl scale-105`
              : manager.status === 'complete'
                ? 'border-green-500 shadow-green-500/50 shadow-2xl'
                : 'border-purple-700'
          }`}
          style={{ minWidth: '420px' }}
        >
          <div className="flex flex-col items-center text-center">
            {/* Manager Avatar - HERO SIZE */}
            <motion.div
              animate={{
                scale: manager.status === 'working' || manager.status === 'deciding' ? [1, 1.05, 1] : 1,
                y: manager.status === 'working' || manager.status === 'deciding' ? [0, -4, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: manager.status === 'working' || manager.status === 'deciding' ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="relative mb-4"
            >
              <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${manager.color} p-2 ${
                manager.status === 'working' || manager.status === 'deciding' ? `${manager.glowColor} shadow-2xl` : ''
              }`}>
                <div className="w-full h-full rounded-2xl bg-slate-900/90 flex items-center justify-center relative overflow-hidden">
                  <manager.icon className={`w-16 h-16 text-white z-10 ${
                    manager.status === 'working' || manager.status === 'deciding' ? 'animate-pulse' : ''
                  }`} />

                  {/* Working Animation */}
                  {(manager.status === 'working' || manager.status === 'deciding') && (
                    <>
                      <motion.div
                        animate={{ y: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 rounded-full bg-purple-400"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Complete State */}
                  {manager.status === 'complete' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Floating Activity Badge */}
              {(manager.status === 'working' || manager.status === 'deciding') && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center border-4 border-slate-900"
                >
                  <Zap className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.div>

            {/* Manager Info */}
            <h2 className="text-3xl font-bold text-white mb-2">{manager.name}</h2>
            <p className="text-sm text-purple-400 font-semibold mb-4">{manager.role}</p>

            {/* Status */}
            <motion.div
              animate={{
                scale: manager.status === 'working' || manager.status === 'deciding' ? [1, 1.1, 1] : 1,
                opacity: manager.status === 'working' || manager.status === 'deciding' ? [0.7, 1, 0.7] : 1
              }}
              transition={{
                duration: 1.5,
                repeat: manager.status === 'working' || manager.status === 'deciding' ? Infinity : 0
              }}
              className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-full ${
                manager.status === 'working' || manager.status === 'deciding'
                  ? 'bg-purple-500/20 border border-purple-500'
                  : manager.status === 'complete'
                    ? 'bg-green-500/20 border border-green-500'
                    : 'bg-slate-700/20'
              }`}
            >
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  manager.status === 'working' || manager.status === 'deciding'
                    ? 'bg-purple-400'
                    : manager.status === 'complete'
                      ? 'bg-green-400'
                      : 'bg-slate-600'
                }`}
              />
              <span className={`text-sm font-semibold ${
                manager.status === 'working' || manager.status === 'deciding'
                  ? 'text-purple-300'
                  : manager.status === 'complete'
                    ? 'text-green-300'
                    : 'text-slate-400'
              }`}>
                {manager.status === 'deciding' && 'REVIEWING IDEAS...'}
                {manager.status === 'working' && 'ORCHESTRATING TEAM...'}
                {manager.status === 'complete' && '✓ MISSION COMPLETE'}
                {manager.status === 'idle' && 'Standby'}
              </span>
            </motion.div>

            {/* Current Thought - Large */}
            <motion.div
              key={manager.currentThought}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-4 bg-slate-800/50 rounded-xl border border-purple-500/30 mb-4"
            >
              <p className="text-base text-purple-300 font-mono flex items-center gap-2 justify-center">
                {(manager.status === 'working' || manager.status === 'deciding') && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.span>
                )}
                {manager.currentThought}
              </p>
            </motion.div>

            {/* Selected Idea Banner */}
            <AnimatePresence>
              {selectedIdea && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400"
                >
                  <p className="text-xs text-slate-400 mb-1">SELECTED FOR ANALYSIS:</p>
                  <p className="text-lg font-bold text-white">🎯 {selectedIdea}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Visual Assignment Arrows */}
      {selectedIdea && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2 my-4"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-8 h-8 text-purple-400" />
          </motion.div>
          <p className="text-sm text-purple-300 font-semibold">ASSIGNING TASKS</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            <ArrowDown className="w-8 h-8 text-purple-400" />
          </motion.div>
        </motion.div>
      )}

      {/* Team Agents (Below Manager) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {teamAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.2 }}
            className="relative"
          >
            {/* Team Agent Card */}
            <div
              className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-500 ${
                agent.status === 'working'
                  ? `border-cyan-500 ${agent.glowColor} shadow-2xl scale-105`
                  : agent.status === 'complete'
                    ? 'border-green-500 shadow-green-500/50 shadow-xl'
                    : 'border-slate-700'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Agent Avatar */}
                <motion.div
                  animate={{
                    scale: agent.status === 'working' ? [1, 1.05, 1] : 1,
                    y: agent.status === 'working' ? [0, -4, 0] : 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: agent.status === 'working' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="relative mb-4"
                >
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${agent.color} p-1.5 ${
                    agent.status === 'working' ? `${agent.glowColor} shadow-2xl` : ''
                  }`}>
                    <div className="w-full h-full rounded-xl bg-slate-900/90 flex items-center justify-center relative overflow-hidden">
                      <agent.icon className={`w-12 h-12 text-white z-10 ${
                        agent.status === 'working' ? 'animate-pulse' : ''
                      }`} />

                      {/* Working Animation */}
                      {agent.status === 'working' && (
                        <>
                          <motion.div
                            animate={{ y: [-100, 100] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"
                          />
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Idle State */}
                      {agent.status === 'idle' && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-slate-700/20"
                        />
                      )}

                      {/* Complete State */}
                      {agent.status === 'complete' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Floating Activity Badge */}
                  {agent.status === 'working' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center border-2 border-slate-900"
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Agent Info */}
                <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                <p className="text-xs text-slate-400 font-semibold mb-3">{agent.role}</p>

                {/* Status Badge */}
                <motion.div
                  className={`flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    agent.status === 'working'
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                      : agent.status === 'complete'
                        ? 'bg-green-500/20 border border-green-500 text-green-300'
                        : 'bg-slate-700/20 text-slate-400'
                  }`}
                >
                  <motion.div
                    animate={{
                      scale: agent.status === 'working' ? [1, 1.3, 1] : 1,
                      opacity: agent.status === 'working' ? [0.5, 1, 0.5] : 1
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: agent.status === 'working' ? Infinity : 0
                    }}
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'working'
                        ? 'bg-cyan-400'
                        : agent.status === 'complete'
                          ? 'bg-green-400'
                          : 'bg-slate-600'
                    }`}
                  />
                  {agent.status === 'idle' && 'Awaiting Task'}
                  {agent.status === 'working' && 'WORKING'}
                  {agent.status === 'complete' && '✓ COMPLETE'}
                </motion.div>

                {/* Progress Bar */}
                <div className="w-full mb-3">
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

                {/* Current Task */}
                <motion.div
                  key={agent.currentThought}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-3 bg-slate-800/50 rounded-lg border border-slate-700 min-h-[60px] flex items-center justify-center"
                >
                  <p className="text-sm text-cyan-400 font-mono">
                    {agent.currentThought}
                  </p>
                </motion.div>

                {/* Completion Sparkle */}
                {agent.status === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-green-400" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-8 max-w-3xl w-full p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30"
      >
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-white">
              {teamAgents.filter(a => a.status === 'complete').length}/{teamAgents.length}
            </p>
            <p className="text-xs text-slate-400">Team Complete</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-400">
              {Math.round(agents.reduce((sum, a) => sum + a.progress, 0) / agents.length)}%
            </p>
            <p className="text-xs text-slate-400">Overall Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5" />
              Live
            </p>
            <p className="text-xs text-slate-400">Real-time Orchestration</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
