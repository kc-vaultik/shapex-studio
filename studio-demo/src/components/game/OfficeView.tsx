import { motion, AnimatePresence } from 'framer-motion'
import { Analysis, Company } from '../../GameApp'
import AgentSprite from './AgentSprite'

interface OfficeViewProps {
  activeAnalysis: Analysis | null
  companies: Company[]
}

export default function OfficeView({ activeAnalysis, companies }: OfficeViewProps) {
  const agents = [
    { id: 'researcher', type: 'researcher' as const, name: 'Researcher', role: 'Market Analysis', x: 15, y: 50 },
    { id: 'validator', type: 'validator' as const, name: 'Validator', role: 'Risk Assessment', x: 42, y: 50 },
    { id: 'strategist', type: 'strategist' as const, name: 'Strategist', role: 'Business Strategy', x: 72, y: 50 }
  ]

  const getActiveAgent = () => {
    if (!activeAnalysis) return null
    if (activeAnalysis.status === 'researching') return agents[0]
    if (activeAnalysis.status === 'validating') return agents[1]
    if (activeAnalysis.status === 'strategizing') return agents[2]
    return null
  }

  const activeAgent = getActiveAgent()

  return (
    <div className="glass rounded-2xl p-6 h-[600px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">🏢 Your AI Office</h2>
        {activeAnalysis && (
          <div className="text-sm">
            <span className="text-neural-cyan">⚡ Analyzing:</span> {activeAnalysis.ideaTitle}
          </div>
        )}
      </div>

      {/* Office Layout */}
      <div className="relative h-full bg-black/20 rounded-xl p-4">
        {/* Office Grid */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 p-4 opacity-10">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-neural-cyan/20" />
          ))}
        </div>

        {/* Rooms */}
        <div className="relative z-10 h-full">
          {/* Research Lab */}
          <motion.div
            className={`absolute glass rounded-lg p-3 border-2 transition-all duration-300 ${
              activeAnalysis?.status === 'researching'
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/50 bg-cyan-500/10'
                : 'border-gray-700/50'
            }`}
            style={{ left: '5%', top: '10%', width: '25%', height: '35%' }}
            animate={activeAnalysis?.status === 'researching' ? {
              borderColor: ['rgba(34, 211, 238, 0.5)', 'rgba(34, 211, 238, 1)', 'rgba(34, 211, 238, 0.5)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-xs font-bold mb-1 text-cyan-400">🔬 Research Lab</div>
            <div className="text-[10px] text-gray-400">Market Analysis</div>
            {activeAnalysis?.status === 'researching' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-cyan-400 mt-2 font-bold"
              >
                ⚡ ANALYZING
              </motion.div>
            )}
          </motion.div>

          {/* Ideation Arena (Validation) */}
          <motion.div
            className={`absolute glass rounded-lg p-3 border-2 transition-all duration-300 ${
              activeAnalysis?.status === 'validating'
                ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 bg-yellow-500/10'
                : 'border-gray-700/50'
            }`}
            style={{ left: '37.5%', top: '10%', width: '25%', height: '35%' }}
            animate={activeAnalysis?.status === 'validating' ? {
              borderColor: ['rgba(250, 204, 21, 0.5)', 'rgba(250, 204, 21, 1)', 'rgba(250, 204, 21, 0.5)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-xs font-bold mb-1 text-yellow-400">⚖️ Ideation Arena</div>
            <div className="text-[10px] text-gray-400">Risk Assessment</div>
            {activeAnalysis?.status === 'validating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-yellow-400 mt-2 font-bold"
              >
                ⚡ VALIDATING
              </motion.div>
            )}
          </motion.div>

          {/* Strategy Room */}
          <motion.div
            className={`absolute glass rounded-lg p-3 border-2 transition-all duration-300 ${
              activeAnalysis?.status === 'strategizing'
                ? 'border-purple-400 shadow-lg shadow-purple-400/50 bg-purple-500/10'
                : 'border-gray-700/50'
            }`}
            style={{ left: '70%', top: '10%', width: '25%', height: '35%' }}
            animate={activeAnalysis?.status === 'strategizing' ? {
              borderColor: ['rgba(168, 85, 247, 0.5)', 'rgba(168, 85, 247, 1)', 'rgba(168, 85, 247, 0.5)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-xs font-bold mb-1 text-purple-400">💡 Strategy Room</div>
            <div className="text-[10px] text-gray-400">Business Strategy</div>
            {activeAnalysis?.status === 'strategizing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-purple-400 mt-2 font-bold"
              >
                ⚡ PLANNING
              </motion.div>
            )}
          </motion.div>

          {/* Company Building Area */}
          <div
            className="absolute glass rounded-lg p-3 border border-gray-700"
            style={{ left: '5%', top: '55%', width: '90%', height: '35%' }}
          >
            <div className="text-xs font-bold mb-3">🏗️ Company Building Floor</div>
            <div className="flex gap-2 flex-wrap">
              <AnimatePresence>
                {companies.map(company => (
                  <motion.div
                    key={company.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`glass rounded-lg p-2 text-xs ${
                      company.status === 'launched'
                        ? 'border border-green-400'
                        : 'border border-yellow-400'
                    }`}
                  >
                    <div className="font-bold truncate w-24">{company.name}</div>
                    <div className="text-[10px] text-gray-400">{company.stage}</div>
                    {company.status === 'launched' && (
                      <div className="text-[10px] text-green-400">
                        ${company.revenue}/mo
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Agents - Ironman Sprites */}
          {agents.map(agent => {
            const isActive = activeAgent?.id === agent.id

            return (
              <motion.div
                key={agent.id}
                className={`absolute ${isActive ? 'z-20' : 'z-10'} transform -translate-x-1/2`}
                style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
              >
                <AgentSprite
                  agent={agent.type}
                  isWorking={isActive}
                  size={100}
                />
                <div className="text-center mt-2">
                  <div className={`text-xs font-bold ${
                    isActive
                      ? agent.type === 'researcher' ? 'text-cyan-400' :
                        agent.type === 'validator' ? 'text-yellow-400' :
                        'text-purple-400'
                      : 'text-gray-500'
                  }`}>
                    {agent.name}
                  </div>
                  <div className="text-[10px] text-gray-600">{agent.role}</div>
                </div>
              </motion.div>
            )
          })}

          {/* Progress Bar for Active Analysis */}
          {activeAnalysis && (
            <div className="absolute bottom-4 left-4 right-4 glass rounded-lg p-3 border border-white/20">
              <div className="text-xs mb-2 flex items-center justify-between">
                <span className="font-bold text-white">
                  {activeAnalysis.status === 'researching' && '🔬 RESEARCHING'}
                  {activeAnalysis.status === 'validating' && '⚖️ VALIDATING'}
                  {activeAnalysis.status === 'strategizing' && '💡 STRATEGIZING'}
                  {activeAnalysis.status === 'complete' && '✅ COMPLETE'}
                </span>
                <span className={`font-bold ${
                  activeAnalysis.progress < 33 ? 'text-cyan-400' :
                  activeAnalysis.progress < 66 ? 'text-yellow-400' :
                  'text-purple-400'
                }`}>
                  {Math.round(activeAnalysis.progress)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    activeAnalysis.progress < 33 ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' :
                    activeAnalysis.progress < 66 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                    'bg-gradient-to-r from-purple-500 to-purple-400'
                  }`}
                  style={{ width: `${activeAnalysis.progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )}

          {/* Idle State */}
          {!activeAnalysis && companies.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">💤</div>
                <div>Office is quiet...</div>
                <div className="text-sm mt-2">Pick an idea from the board to get started!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
