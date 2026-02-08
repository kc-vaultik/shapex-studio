import { motion } from 'framer-motion'

interface Agent {
  id: string
  status: 'idle' | 'active' | 'waiting' | 'complete'
}

interface NeuralConnectionProps {
  fromAgent: Agent
  toAgent: Agent
  isActive: boolean
}

export default function NeuralConnection({ fromAgent, toAgent, isActive }: NeuralConnectionProps) {
  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#00FFF5', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#00D9FF', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>

        {/* Animated connection line */}
        <motion.line
          x1="33%"
          y1="50%"
          x2="66%"
          y2="50%"
          stroke="url(#connectionGradient)"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        {/* Animated particles flowing along the line */}
        {[0, 0.25, 0.5, 0.75].map((delay, index) => (
          <motion.circle
            key={index}
            r="4"
            fill="#00FFF5"
            initial={{ cx: '33%', cy: '50%' }}
            animate={{
              cx: ['33%', '66%'],
              cy: '50%',
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: delay * 2,
              ease: 'linear'
            }}
          />
        ))}
      </svg>

      {/* Data transfer label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="glass rounded-full px-4 py-2 text-xs font-semibold text-neural-cyan whitespace-nowrap">
          ⚡ Transferring insights...
        </div>
      </motion.div>
    </div>
  )
}
