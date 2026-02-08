import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string
  change: number
  loading: boolean
}

export default function MetricCard({ icon, label, value, change, loading }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-6 relative overflow-hidden"
    >
      {loading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-cyan/10 to-transparent"
          animate={{
            x: [-300, 300]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-neural-cyan">
            {icon}
          </div>
          <p className="text-sm text-gray-400">{label}</p>
        </div>

        <motion.div
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <h3 className="text-3xl font-bold mb-2">
            {loading ? (
              <span className="text-gray-600">Loading...</span>
            ) : (
              value
            )}
          </h3>
        </motion.div>

        {!loading && change > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm"
          >
            <span className="text-green-400">↗️</span>
            <span className="text-green-400 font-semibold">+{change}%</span>
            <span className="text-gray-500">from last scan</span>
          </motion.div>
        )}

        {!loading && (
          <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neural-blue to-neural-cyan"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
