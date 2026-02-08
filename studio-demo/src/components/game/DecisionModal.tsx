import { motion } from 'framer-motion'
import { Decision } from '../../GameApp'

interface DecisionModalProps {
  decision: Decision
  onChoose: (optionId: string) => void
  playerMoney: number
}

export default function DecisionModal({ decision, onChoose, playerMoney }: DecisionModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl p-8 max-w-2xl w-full border-2 border-neural-cyan neural-glow-strong"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-2xl font-bold mb-2">{decision.title}</h2>
          <p className="text-gray-400">{decision.description}</p>
        </div>

        <div className="space-y-4">
          {decision.options.map((option, index) => {
            const canAfford = playerMoney >= option.cost

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: canAfford ? 1.02 : 1 }}
                whileTap={{ scale: canAfford ? 0.98 : 1 }}
                onClick={() => canAfford && onChoose(option.id)}
                disabled={!canAfford}
                className={`w-full glass rounded-xl p-4 text-left border-2 transition-all ${
                  canAfford
                    ? 'border-neural-cyan/30 hover:border-neural-cyan hover:neural-glow'
                    : 'border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-lg">{option.label}</div>
                  {option.cost > 0 && (
                    <div className={canAfford ? 'text-yellow-400' : 'text-red-400'}>
                      ${option.cost.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-300">{option.impact}</div>
                {!canAfford && option.cost > 0 && (
                  <div className="text-xs text-red-400 mt-2">
                    Not enough budget!
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Choose wisely - this will affect your venture success!
        </div>
      </motion.div>
    </motion.div>
  )
}
