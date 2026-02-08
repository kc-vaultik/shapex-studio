import { motion } from 'framer-motion'
import { DollarSign, Award } from 'lucide-react'
import { GameState } from '../../GameApp'

interface ResourceBarProps {
  gameState: GameState
}

export default function ResourceBar({ gameState }: ResourceBarProps) {
  return (
    <div className="flex items-center gap-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="glass rounded-full px-4 py-2 flex items-center gap-2"
      >
        <DollarSign size={20} className="text-green-400" />
        <div>
          <div className="text-xs text-gray-400">Budget</div>
          <div className="font-bold">${gameState.money.toLocaleString()}</div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="glass rounded-full px-4 py-2 flex items-center gap-2"
      >
        <Award size={20} className="text-yellow-400" />
        <div>
          <div className="text-xs text-gray-400">Reputation</div>
          <div className="font-bold">{gameState.reputation}</div>
        </div>
      </motion.div>
    </div>
  )
}
