import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface NeuralStreamProps {
  messages: string[]
}

export default function NeuralStream({ messages }: NeuralStreamProps) {
  const streamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-3 h-3 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-xl font-bold">🔴 LIVE NEURAL STREAM</h2>
        </div>

        <div
          ref={streamRef}
          className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-neural-cyan scrollbar-track-gray-800"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-600 text-center py-20"
              >
                Waiting for agents to start...
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 flex items-start gap-2"
                >
                  <span className="text-neural-cyan flex-shrink-0">▸</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-300"
                  >
                    {message}
                  </motion.span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
