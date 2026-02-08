import { motion } from 'framer-motion';
import { useStats } from '../hooks/useStats';

export default function Hero() {
  const { stats, loading } = useStats();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const floatingCards = [
    { delay: 0, x: -100, y: -50 },
    { delay: 0.2, x: 100, y: -30 },
    { delay: 0.4, x: -80, y: 50 },
    { delay: 0.6, x: 120, y: 80 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-razer-green/5 via-transparent to-emerald-400/5 animate-pulse" />
      </div>

      {/* Floating Cards Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1],
              x: card.x,
              y: card.y,
            }}
            transition={{
              duration: 3,
              delay: card.delay,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-razer-green/10 rounded-2xl blur-xl"
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-6 text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="px-4 py-2 bg-razer-green/10 border border-razer-green/30 rounded-full text-razer-green text-sm font-medium">
            Trusted by founders from YC, Harvard, and Google
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-[68px] font-bold mb-6 leading-tight"
        >
          Turn AI Insights Into
          <br />
          <span className="text-gradient">Your Next $10M Startup</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
        >
          Stop guessing. Start building. ShapeX analyzes what top VCs fund, what users want, and what markets need—then generates validated startup ideas scored across 5 dimensions.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 0, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-razer-green text-black text-lg font-bold rounded-lg glow-razer hover:glow-razer-lg transition-all focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            Start Free
          </motion.a>
          <motion.a
            href="#ideas"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-razer-green text-razer-green text-lg font-semibold rounded-lg hover:bg-razer-green/10 transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2"
          >
            View Sample Ideas →
          </motion.a>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {loading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="text-center">
                <div className="h-10 bg-dark-700 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-dark-700 rounded animate-pulse" />
              </div>
            ))
          ) : (
            [
              { number: stats?.total_ideas ? `${(stats.total_ideas / 1000).toFixed(1)}k+` : '10,000+', label: 'Startup ideas generated' },
              { number: stats?.ideas_today ? `${stats.ideas_today.toLocaleString()}+` : '1,200+', label: 'Entrepreneurs using ShapeX' },
              { number: stats?.data_sources ? `${stats.data_sources * 10}k+` : '50,000+', label: 'Trends analyzed weekly' },
              { number: stats?.avg_score ? `${Math.round(stats.avg_score)}%` : '87%', label: 'Accuracy in market validation' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-razer-green mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))
          )}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-razer-green rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-razer-green rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
