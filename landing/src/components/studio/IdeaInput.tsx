import { useState } from 'react';
import { motion } from 'framer-motion';

interface IdeaInputProps {
  onSubmit: (idea: string) => void;
}

const EXAMPLE_IDEAS = [
  'AI email assistant for busy founders',
  'No-code website builder for restaurants',
  'Crypto trading bot for beginners',
  'AI customer support tool for SaaS',
];

export default function IdeaInput({ onSubmit }: IdeaInputProps) {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setIdea(example);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-razer-green">🚀 ShapeX Studio</span>
          </h1>
          <p className="text-xl text-gray-400">
            Validate Your Startup Idea
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to build?
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your startup idea..."
              className="w-full h-32 px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-razer-green focus:ring-1 focus:ring-razer-green resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!idea.trim()}
            className="w-full py-4 bg-razer-green text-black font-bold text-lg rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-razer-green"
          >
            Validate My Idea →
          </button>

          <p className="text-center text-sm text-gray-500 mt-3">
            Takes ~8 minutes
          </p>
        </form>

        {/* Examples */}
        <div className="mt-8">
          <p className="text-sm text-gray-400 mb-3">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 text-sm bg-dark-800 text-gray-300 rounded-lg border border-gray-700 hover:border-razer-green hover:text-razer-green transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
