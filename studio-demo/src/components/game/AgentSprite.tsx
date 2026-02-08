import { motion } from 'framer-motion'
import { User, Brain, Shield, Target } from 'lucide-react'

interface AgentSpriteProps {
  agent: 'researcher' | 'validator' | 'strategist' | 'player'
  isWorking?: boolean
  size?: number
}

const AGENT_COLORS = {
  researcher: 'text-cyan-400',
  validator: 'text-yellow-400',
  strategist: 'text-purple-400',
  player: 'text-white'
}

const AGENT_GLOW = {
  researcher: 'shadow-cyan-400/50',
  validator: 'shadow-yellow-400/50',
  strategist: 'shadow-purple-400/50',
  player: 'shadow-white/30'
}

const AGENT_NAMES = {
  researcher: 'Researcher',
  validator: 'Validator',
  strategist: 'Strategist',
  player: 'You'
}

const AGENT_ICONS = {
  researcher: Brain,
  validator: Shield,
  strategist: Target,
  player: User
}

export default function AgentSprite({ agent, isWorking = false, size = 120 }: AgentSpriteProps) {
  const Icon = AGENT_ICONS[agent]
  const spritePath = `/sprites/${agent}.png`

  // Check if sprite image exists, fallback to icon
  const [useSprite, setUseSprite] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = spritePath
    img.onload = () => setUseSprite(true)
    img.onerror = () => setUseSprite(false)
  }, [spritePath])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect when working */}
      {isWorking && (
        <motion.div
          className={`absolute inset-0 rounded-full blur-xl ${AGENT_GLOW[agent]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            background: agent === 'researcher' ? 'rgba(34, 211, 238, 0.3)' :
                       agent === 'validator' ? 'rgba(250, 204, 21, 0.3)' :
                       agent === 'strategist' ? 'rgba(168, 85, 247, 0.3)' :
                       'rgba(255, 255, 255, 0.2)'
          }}
        />
      )}

      {/* Sprite or Icon */}
      <motion.div
        className={`relative z-10 flex flex-col items-center justify-center`}
        animate={isWorking ? {
          y: [-4, 4, -4],
          rotate: [-2, 2, -2]
        } : {}}
        transition={isWorking ? {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        } : {}}
      >
        {useSprite ? (
          // Use Midjourney sprite
          <motion.img
            src={spritePath}
            alt={AGENT_NAMES[agent]}
            className="w-full h-full object-contain drop-shadow-2xl"
            animate={isWorking ? { scale: [1, 1.05, 1] } : {}}
            transition={isWorking ? {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            } : {}}
          />
        ) : (
          // Fallback to icon placeholder
          <div className={`w-full h-full flex flex-col items-center justify-center glass rounded-2xl border-2 ${
            isWorking ? 'border-white/50' : 'border-white/20'
          }`}>
            <Icon
              size={size * 0.4}
              className={`${AGENT_COLORS[agent]} mb-2`}
              strokeWidth={1.5}
            />
            <div className={`text-xs font-bold ${AGENT_COLORS[agent]}`}>
              {AGENT_NAMES[agent]}
            </div>
          </div>
        )}
      </motion.div>

      {/* Data stream particles when working */}
      {isWorking && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                agent === 'researcher' ? 'bg-cyan-400' :
                agent === 'validator' ? 'bg-yellow-400' :
                agent === 'strategist' ? 'bg-purple-400' :
                'bg-white'
              }`}
              initial={{
                left: '50%',
                bottom: '10%',
                opacity: 0
              }}
              animate={{
                y: [-size, -size * 2],
                x: [0, (Math.random() - 0.5) * 40],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Status indicator */}
      {isWorking && (
        <motion.div
          className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
            agent === 'researcher' ? 'bg-cyan-500/80 text-white' :
            agent === 'validator' ? 'bg-yellow-500/80 text-black' :
            agent === 'strategist' ? 'bg-purple-500/80 text-white' :
            'bg-white/80 text-black'
          }`}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
        >
          ANALYZING...
        </motion.div>
      )}
    </div>
  )
}

// Add import
import { useState, useEffect } from 'react'
