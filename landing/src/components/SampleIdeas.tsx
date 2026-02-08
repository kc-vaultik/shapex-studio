import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { fetchIdeas, type Idea } from '../utils/api';

export default function SampleIdeas() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const loadIdeas = async () => {
      setLoading(true);
      const data = await fetchIdeas(5);
      setIdeas(data);
      setLoading(false);
    };

    if (isInView) {
      loadIdeas();
    }
  }, [isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-razer-green';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 85) return 'shadow-lg shadow-razer-green/30';
    if (score >= 70) return 'shadow-lg shadow-yellow-400/30';
    return 'shadow-lg shadow-orange-400/30';
  };

  return (
    <section id="ideas" className="py-24 bg-dark-900" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sample <span className="text-gradient">Opportunities</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Here are some recent high-scoring ideas discovered by ShapeX. Real data,
            real opportunities.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="p-6 bg-dark-800 border border-dark-700 rounded-2xl animate-pulse"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-dark-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-dark-700 rounded w-1/4" />
                  </div>
                  <div className="h-16 w-16 bg-dark-700 rounded-full" />
                </div>
                <div className="h-4 bg-dark-700 rounded w-full mb-2" />
                <div className="h-4 bg-dark-700 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12 bg-dark-800 border border-dark-700 rounded-2xl"
          >
            <p className="text-gray-400 text-lg mb-4">
              No ideas available yet. Check back soon!
            </p>
            <p className="text-gray-500 text-sm">
              Start the ShapeX backend to see real-time ideas.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-6"
          >
            {ideas.map((idea) => (
              <motion.div
                key={idea.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-dark-800 border border-dark-700 rounded-2xl hover:border-razer-green/30 transition-all cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === idea.id ? null : idea.id)
                }
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-razer-green">
                        {idea.title}
                      </h3>
                      <span className="px-3 py-1 bg-dark-700 border border-dark-600 rounded-full text-xs text-gray-400">
                        {idea.category}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">
                      {expandedId === idea.id
                        ? idea.description
                        : idea.description.length > 150
                        ? `${idea.description.slice(0, 150)}...`
                        : idea.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Source: {idea.source}</span>
                      <span>•</span>
                      <span>
                        {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreGlow(
                        idea.overall_score
                      )} bg-gradient-to-br from-dark-700 to-dark-900 border-4 ${
                        idea.overall_score >= 85
                          ? 'border-razer-green'
                          : idea.overall_score >= 70
                          ? 'border-yellow-400'
                          : 'border-orange-400'
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold ${getScoreColor(
                            idea.overall_score
                          )}`}
                        >
                          {idea.overall_score}
                        </div>
                        <div className="text-xs text-gray-400">SCORE</div>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === idea.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-dark-700"
                  >
                    <h4 className="text-lg font-semibold mb-4 text-razer-green">
                      Score Breakdown
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        {
                          label: 'Feasibility',
                          score: idea.feasibility_score,
                          weight: '15%',
                        },
                        {
                          label: 'Market',
                          score: idea.market_score,
                          weight: '30%',
                        },
                        {
                          label: 'Monetization',
                          score: idea.monetization_score,
                          weight: '35%',
                        },
                        {
                          label: 'Competition',
                          score: idea.competition_score,
                          weight: '10%',
                        },
                        { label: 'Risk', score: idea.risk_score, weight: '10%' },
                      ].map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="text-center p-4 bg-dark-900 rounded-lg"
                        >
                          <div className="text-2xl font-bold text-razer-green mb-1">
                            {metric.score}
                          </div>
                          <div className="text-sm text-gray-400">
                            {metric.label}
                          </div>
                          <div className="text-xs text-gray-600">
                            {metric.weight}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-6">
            Want to see more? Get full access to thousands of ideas.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-razer-green text-black font-bold rounded-lg glow-razer hover:glow-razer-lg transition-all"
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
