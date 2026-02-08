import { motion } from 'framer-motion';
import type { Agent } from './AgentCanvas';

interface AgentProgressBarProps {
  agents: Agent[];
  activeAgentId?: string;
}

const AGENT_COLORS = {
  blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
  green: 'border-green-500 bg-green-500/10 text-green-400',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
};

const AGENT_GLOW = {
  blue: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  green: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  purple: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
};

export default function AgentProgressBar({ agents }: AgentProgressBarProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-dark-800 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-center gap-8">
        {agents.map((agent, index) => (
          <div key={agent.id} className="flex items-center gap-4">
            {/* Agent Card */}
            <motion.div
              className={`
                relative w-32 h-40 rounded-lg border-2 p-4 flex flex-col items-center justify-center
                ${AGENT_COLORS[agent.color as keyof typeof AGENT_COLORS]}
                ${agent.status === 'active' ? AGENT_GLOW[agent.color as keyof typeof AGENT_GLOW] : ''}
                transition-all duration-300
              `}
              animate={
                agent.status === 'active'
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { duration: 2, repeat: Infinity },
                    }
                  : {}
              }
            >
              {/* Icon */}
              <div className="text-4xl mb-2">{agent.icon}</div>

              {/* Name */}
              <div className="text-xs font-semibold text-center mb-2">
                {agent.name.split(' ').map((word, i) => (
                  <div key={i}>{word}</div>
                ))}
              </div>

              {/* Status Badge */}
              <div
                className={`
                  text-xs font-bold px-2 py-1 rounded
                  ${
                    agent.status === 'done'
                      ? 'bg-green-500 text-black'
                      : agent.status === 'active'
                      ? 'bg-yellow-400 text-black animate-pulse'
                      : 'bg-gray-700 text-gray-400'
                  }
                `}
              >
                {agent.status === 'done'
                  ? 'DONE ✓'
                  : agent.status === 'active'
                  ? 'ACTIVE'
                  : 'QUEUE'}
              </div>

              {/* Duration */}
              <div className="text-xs text-gray-400 mt-2">
                {agent.status === 'done' || agent.status === 'active'
                  ? formatDuration(agent.duration)
                  : '--:--'}
              </div>

              {/* Progress Bar (only for active) */}
              {agent.status === 'active' && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-razer-green"
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Arrow (not after last agent) */}
            {index < agents.length - 1 && (
              <div className="text-2xl text-gray-600">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
