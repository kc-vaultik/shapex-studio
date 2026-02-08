import { motion } from 'framer-motion'
import { Zap, Lock } from 'lucide-react'

export default function AgentUpgrade() {
  const upgrades = [
    { id: '1', name: 'Speed Boost', cost: 10000, level: 2, locked: true },
    { id: '2', name: 'Better Insights', cost: 15000, level: 3, locked: true },
    { id: '3', name: '4th Agent', cost: 25000, level: 4, locked: true },
  ]

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Zap size={20} className="text-yellow-400" />
        Upgrades
      </h3>

      <div className="space-y-2">
        {upgrades.map((upgrade) => (
          <div
            key={upgrade.id}
            className="glass rounded-lg p-3 border border-gray-700 opacity-60"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-sm">{upgrade.name}</div>
              <Lock size={14} className="text-gray-500" />
            </div>
            <div className="text-xs text-gray-400">
              Unlock at Level {upgrade.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
