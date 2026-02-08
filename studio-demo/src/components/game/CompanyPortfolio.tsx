import { motion } from 'framer-motion'
import { Building2, TrendingUp } from 'lucide-react'
import { Company } from '../../GameApp'

interface CompanyPortfolioProps {
  companies: Company[]
}

export default function CompanyPortfolio({ companies }: CompanyPortfolioProps) {
  if (companies.length === 0) return null

  const totalRevenue = companies.reduce((sum, c) => sum + c.revenue, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <h3 className="text-lg font-bold mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Building2 size={20} />
          Your Portfolio
        </span>
        <span className="text-sm text-green-400">
          <TrendingUp size={14} className="inline" /> ${totalRevenue}/mo
        </span>
      </h3>

      <div className="space-y-2">
        {companies.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass rounded-lg p-3 border ${
              company.status === 'launched'
                ? 'border-green-400/30'
                : company.status === 'building'
                ? 'border-yellow-400/30'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="font-bold text-sm truncate flex-1">{company.name}</div>
              {company.status === 'launched' && (
                <div className="text-xs text-green-400 ml-2">✓</div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-400">{company.stage}</div>
              {company.revenue > 0 && (
                <div className="text-green-400">${company.revenue}/mo</div>
              )}
            </div>

            {company.status === 'building' && (
              <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
