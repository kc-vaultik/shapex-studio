import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogMessage } from './AgentCanvas';

interface LiveLogProps {
  messages: LogMessage[];
}

const MESSAGE_TYPE_STYLES = {
  info: 'text-gray-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

export default function LiveLog({ messages }: LiveLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-dark-800 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-dark-900 px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm font-semibold text-white">LIVE LOG</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Log Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`
                ${MESSAGE_TYPE_STYLES[msg.type]}
                ${msg.highlight ? 'font-bold' : ''}
                hover:bg-dark-700 px-2 py-1 rounded transition-colors
              `}
            >
              <span className="text-gray-600">[{msg.timestamp}]</span>{' '}
              <span className={msg.highlight ? 'text-razer-green' : ''}>
                {msg.agentName}:
              </span>{' '}
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
