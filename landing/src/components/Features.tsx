import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '🤖',
    title: 'Ideas That Write Themselves',
    description:
      'Our AI scans YC Requests for Startups, A16Z theses, Product Hunt trends, and Google search data to generate startup ideas before your competitors see them.',
  },
  {
    icon: '📊',
    title: 'Know Before You Build',
    description:
      'Every idea gets scored on feasibility, market demand, monetization potential, competition, and risk. Skip months of research—see what works in seconds.',
  },
  {
    icon: '⚡',
    title: 'Stay Ahead of Trends',
    description:
      'Access fresh ideas via API or scheduled scans. Get daily updates on emerging opportunities while others are still reading newsletters.',
  },
  {
    icon: '💎',
    title: 'Learn From the Best',
    description:
      'Built on the signals that matter: Y Combinator RFS, Andreessen Horowitz focus areas, and real user demand from Product Hunt and Google Trends.',
  },
  {
    icon: '🚀',
    title: 'Built for Builders',
    description:
      'Get more than inspiration. Every idea includes market analysis, monetization paths, and risk factors. Stop planning, start shipping.',
  },
];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

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

  return (
    <section id="features" className="py-24 bg-dark-900" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Stop Guessing. <span className="text-gradient">Start Validating.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to discover and validate the next big venture
            opportunity.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -10,
                boxShadow: '0 20px 40px rgba(0, 255, 0, 0.2)',
              }}
              className="p-8 bg-dark-800 border border-dark-700 rounded-2xl cursor-pointer transition-all"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-razer-green">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 p-12 bg-gradient-to-br from-dark-800 to-dark-900 border border-razer-green/30 rounded-3xl"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Built for <span className="text-gradient">Builders</span>
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                Whether you're a solo founder, indie hacker, or VC firm, ShapeX
                adapts to your workflow with flexible APIs, webhooks, and
                integrations.
              </p>
              <ul className="space-y-4">
                {[
                  'RESTful API with comprehensive documentation',
                  'Webhook support for custom workflows',
                  'Export data in JSON, CSV, or PDF formats',
                  'Team collaboration and sharing features',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-razer-green mr-3 text-xl">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="p-6 bg-dark-900 rounded-2xl border border-dark-700">
                <div className="font-mono text-sm">
                  <div className="text-gray-500">// Fetch top ideas</div>
                  <div className="text-razer-green">
                    const ideas = await shapex
                  </div>
                  <div className="pl-4 text-gray-300">
                    .ideas.list({'{'}
                  </div>
                  <div className="pl-8 text-gray-300">
                    limit: 10,
                  </div>
                  <div className="pl-8 text-gray-300">
                    minScore: 85,
                  </div>
                  <div className="pl-8 text-gray-300">
                    category: 'AI'
                  </div>
                  <div className="pl-4 text-gray-300">
                    {'}'});
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-razer-green/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
