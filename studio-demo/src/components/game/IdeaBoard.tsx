import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Zap } from 'lucide-react'

interface Idea {
  id: string
  title: string
  description: string
  cost: number
  estimatedRevenue: number
  difficulty: string
  market: string
}

interface IdeaBoardProps {
  ideas: Idea[]
  onSelectIdea: (idea: Idea) => void
  playerMoney: number
}

export default function IdeaBoard({ ideas, onSelectIdea, playerMoney }: IdeaBoardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'Hard': return 'text-orange-400'
      case 'Very Hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-2xl">📋</span>
        Y Combinator Ideas
      </h3>

      <div className="space-y-3 max-h-[700px] overflow-y-auto">
        {ideas.map((idea, index) => {
          const canAfford = playerMoney >= idea.cost

          return (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: canAfford ? 1.02 : 1 }}
              className={`glass rounded-lg p-3 border ${
                canAfford
                  ? 'border-neural-cyan/30 hover:border-neural-cyan cursor-pointer'
                  : 'border-gray-700 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canAfford && onSelectIdea(idea)}
            >
              <div className="font-bold text-sm mb-1">{idea.title}</div>
              <div className="text-xs text-gray-400 mb-2">{idea.description}</div>

              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="glass rounded px-2 py-1">
                  <TrendingUp size={10} className="inline mr-1" />
                  {idea.market}
                </span>
                <span className={`glass rounded px-2 py-1 ${getDifficultyColor(idea.difficulty)}`}>
                  <Zap size={10} className="inline mr-1" />
                  {idea.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="text-red-400">
                  <DollarSign size={12} className="inline" />
                  Cost: ${idea.cost.toLocaleString()}
                </div>
                <div className="text-green-400">
                  Est: ${idea.estimatedRevenue.toLocaleString()}/mo
                </div>
              </div>

              {!canAfford && (
                <div className="text-xs text-red-400 mt-1 text-center">
                  Not enough budget!
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
