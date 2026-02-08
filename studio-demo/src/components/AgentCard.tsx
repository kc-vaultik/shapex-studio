import { motion } from 'framer-motion'

interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  status: 'idle' | 'active' | 'waiting' | 'complete'
  progress: number
  currentAction: string
}

interface AgentCardProps {
  agent: Agent
}

export default function AgentCard({ agent }: AgentCardProps) {
  const getStatusColor = () => {
    switch (agent.status) {
      case 'active': return 'text-neural-cyan'
      case 'complete': return 'text-green-400'
      case 'waiting': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'active': return '✨'
      case 'complete': return '✅'
      case 'waiting': return '⏸️'
      default: return '💤'
    }
  }

  const getStatusLabel = () => {
    switch (agent.status) {
      case 'active': return 'ACTIVE'
      case 'complete': return 'COMPLETE'
      case 'waiting': return 'WAITING'
      default: return 'IDLE'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: agent.status === 'active' ? [0, -5, 0] : 0
      }}
      transition={{
        y: {
          duration: 2,
          repeat: agent.status === 'active' ? Infinity : 0,
          ease: 'easeInOut'
        }
      }}
      className={`glass rounded-2xl p-6 relative overflow-hidden ${
        agent.status === 'active' ? 'neural-glow' : ''
      }`}
    >
      {/* Active glow animation */}
      {agent.status === 'active' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-cyan/10 to-transparent"
          animate={{
            x: [-500, 500]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}

      <div className="relative z-10">
        {/* Avatar & Name */}
        <div className="text-center mb-4">
          <motion.div
            animate={{
              scale: agent.status === 'active' ? [1, 1.1, 1] : 1
            }}
            transition={{
              duration: 1.5,
              repeat: agent.status === 'active' ? Infinity : 0,
            }}
            className="text-6xl mb-3"
          >
            {agent.avatar}
          </motion.div>
          <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
          <p className="text-sm text-gray-400">🤖 {agent.role}</p>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusIcon()} {getStatusLabel()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neural-blue to-neural-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${agent.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {agent.progress}%
          </div>
        </div>

        {/* Current Action */}
        <div className="glass rounded-lg p-3 min-h-[80px]">
          <p className="text-sm text-gray-400 mb-1">Current Action:</p>
          <motion.p
            key={agent.currentAction}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-white"
          >
            💭 {agent.currentAction}
          </motion.p>
        </div>

        {/* Activity Indicator */}
        {agent.status === 'active' && (
          <div className="mt-3 flex items-center justify-center gap-1">
            <motion.div
              className="w-2 h-2 rounded-full bg-neural-cyan"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-neural-cyan"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-neural-cyan"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
