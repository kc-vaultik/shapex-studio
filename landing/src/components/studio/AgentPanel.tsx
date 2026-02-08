import { motion } from 'framer-motion';
import type { Agent } from './AgentCanvas';

interface AgentPanelProps {
  agent: Agent;
}

const AGENT_BG = {
  blue: 'bg-blue-500/5 border-blue-500',
  green: 'bg-green-500/5 border-green-500',
  purple: 'bg-purple-500/5 border-purple-500',
};

const AGENT_TEXT = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
};

export default function AgentPanel({ agent }: AgentPanelProps) {
  // Mock data - will be replaced with real agent outputs
  const renderContent = () => {
    switch (agent.id) {
      case 'researcher':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                📊 Market Research
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Competitors Found</div>
                  <div className="text-2xl font-bold text-white">23</div>
                </div>
                <div className="bg-dark-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Total Addressable Market</div>
                  <div className="text-2xl font-bold text-razer-green">$12.4B</div>
                </div>
                <div className="bg-dark-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Market Growth</div>
                  <div className="text-2xl font-bold text-green-400">+24% YoY</div>
                </div>
                <div className="bg-dark-900 p-3 rounded border border-gray-700">
                  <div className="text-xs text-gray-400">Customer Personas</div>
                  <div className="text-2xl font-bold text-white">4</div>
                </div>
              </div>
            </div>
            <div className="bg-dark-900 p-4 rounded border border-gray-700">
              <div className="text-xs text-gray-400 mb-2">💡 Key Insight</div>
              <div className="text-sm text-white">
                "47% of support teams want better AI solutions. Current alternatives are
                clunky and don't understand product context."
              </div>
            </div>
          </div>
        );

      case 'validator':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                📊 Scoring Dimensions
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Feasibility', score: 8.2, color: 'bg-blue-500' },
                  { name: 'Market Demand', score: 9.4, color: 'bg-razer-green' },
                  { name: 'Monetization', score: 8.7, color: 'bg-purple-500' },
                  { name: 'Competition', score: 6.3, color: 'bg-yellow-500' },
                  { name: 'Risk', score: 7.9, color: 'bg-orange-500' },
                ].map((dim) => (
                  <div key={dim.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{dim.name}</span>
                      <span className="text-white font-semibold">
                        {dim.score}/10
                        {dim.score >= 9 && ' ⭐'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${dim.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.score * 10}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-900 p-4 rounded border border-green-500">
              <div className="text-sm font-semibold text-razer-green mb-2">
                Overall Score: 8.1/10 ⭐⭐⭐⭐
              </div>
              <div className="text-xs text-gray-400">
                Strong market demand with clear monetization. Competition is high but
                differentiation is possible.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500 p-3 rounded">
                <div className="text-xs font-semibold text-red-400 mb-2">
                  🚩 Red Flags
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Well-funded competitors</li>
                  <li>• Need strong partnerships</li>
                </ul>
              </div>
              <div className="bg-green-500/10 border border-green-500 p-3 rounded">
                <div className="text-xs font-semibold text-green-400 mb-2">
                  💚 Green Lights
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Clear pain point</li>
                  <li>• Willingness to pay</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'strategist':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                💰 Pricing Strategy
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { tier: 'Starter', price: '$299', usage: '1K tickets/mo' },
                  { tier: 'Growth', price: '$699', usage: '5K tickets/mo', featured: true },
                  { tier: 'Scale', price: '$1,499', usage: '20K tickets/mo' },
                ].map((plan) => (
                  <div
                    key={plan.tier}
                    className={`p-4 rounded border ${
                      plan.featured
                        ? 'bg-purple-500/10 border-purple-500'
                        : 'bg-dark-900 border-gray-700'
                    }`}
                  >
                    <div className="text-xs text-gray-400">{plan.tier}</div>
                    <div className="text-xl font-bold text-white">{plan.price}</div>
                    <div className="text-xs text-gray-400">/month</div>
                    <div className="text-xs text-gray-500 mt-2">{plan.usage}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                🚀 Go-to-Market Strategy
              </h3>
              <div className="space-y-2">
                {[
                  { channel: 'Zapier Integration', effectiveness: 95 },
                  { channel: 'SEO Content', effectiveness: 85 },
                  { channel: 'Cold Email', effectiveness: 75 },
                ].map((channel) => (
                  <div key={channel.channel}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">✅ {channel.channel}</span>
                      <span className="text-white">{channel.effectiveness}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${channel.effectiveness}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-900 p-4 rounded border border-purple-500">
              <div className="text-xs text-gray-400 mb-2">📍 Positioning</div>
              <div className="text-sm text-white font-medium">
                "The only AI support tool that learns YOUR product, not generic responses."
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`
        rounded-lg border-2 p-6
        ${AGENT_BG[agent.color as keyof typeof AGENT_BG]}
      `}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{agent.icon}</div>
        <div>
          <h2
            className={`text-lg font-bold ${AGENT_TEXT[agent.color as keyof typeof AGENT_TEXT]}`}
          >
            {agent.name}
          </h2>
          <div className="text-sm text-gray-400">Working...</div>
        </div>
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </motion.div>
  );
}
