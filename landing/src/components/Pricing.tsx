import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const pricingTiers = [
  {
    name: 'Explorer',
    price: '$0',
    period: 'forever',
    description: 'Start discovering opportunities',
    features: [
      '10 AI-generated ideas per month',
      'Basic 5D scoring',
      'Daily trend email',
      'Community Discord access',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Indie',
    price: '$29',
    period: 'per month',
    description: 'Perfect for solo founders',
    features: [
      '100 ideas per month',
      'Full 5D scoring + insights',
      'API access (1,000 calls/mo)',
      'Daily + weekly reports',
      'Priority email support',
      'Export to Notion/Airtable',
    ],
    cta: 'Start Indie',
    highlighted: true,
    badge: 'MOST POPULAR',
  },
  {
    name: 'Pro',
    price: '$99',
    period: 'per month',
    description: 'For serious builders',
    features: [
      'Unlimited ideas',
      'Advanced scoring algorithms',
      'API access (10,000 calls/mo)',
      'Custom trend tracking',
      'Slack/Discord webhooks',
      'Competitor monitoring',
      '1-on-1 strategy session (monthly)',
    ],
    cta: 'Go Pro',
    highlighted: false,
  },
  {
    name: 'Venture',
    price: '$499',
    period: 'per month',
    description: 'Intelligence for investment firms',
    features: [
      'Everything in Pro',
      'Unlimited API calls',
      'White-label reports',
      'Custom data sources',
      'Multi-user accounts',
      'Dedicated account manager',
      'Private Slack channel',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [, setHoveredIndex] = useState<number | null>(null);

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
    <section id="pricing" className="py-24 bg-dark-800" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Start Free. <span className="text-gradient">Scale When You're Ready.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
          <p className="text-sm text-gray-500">
            30-day money-back guarantee • Cancel anytime • No setup fees
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className={`relative p-8 rounded-2xl transition-all ${
                tier.highlighted
                  ? 'bg-gradient-to-br from-razer-green/20 to-emerald-400/20 border-2 border-razer-green'
                  : 'bg-dark-900 border border-dark-700'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-razer-green text-black text-sm font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-razer-green">
                    {tier.price}
                  </span>
                  {tier.period !== 'contact us' && (
                    <span className="text-gray-400 ml-2">/{tier.period}</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className="text-razer-green mr-3 text-lg">✓</span>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => {
                  if (tier.name === 'Venture') {
                    window.location.href = 'mailto:sales@shapex.ai?subject=Venture Plan Inquiry';
                  } else {
                    window.location.href = `/signup?tier=${tier.name.toLowerCase()}`;
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.highlighted
                    ? 'bg-razer-green text-black hover:glow-razer focus-visible:outline-white'
                    : 'bg-dark-700 text-white hover:bg-dark-600 focus-visible:outline-razer-green'
                }`}
              >
                {tier.cta}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Compare <span className="text-gradient">All Features</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-dark-900 rounded-2xl border border-dark-700">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="p-4 text-left">Feature</th>
                  <th className="p-4 text-center">Free</th>
                  <th className="p-4 text-center">Indie</th>
                  <th className="p-4 text-center bg-razer-green/10">Pro</th>
                  <th className="p-4 text-center">VC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Ideas per day', values: ['5', '50', 'Unlimited', 'Unlimited'] },
                  { name: 'Scan frequency', values: ['Weekly', 'Daily', 'Hourly', 'Real-time'] },
                  { name: 'API requests/day', values: ['-', '100', '1,000', 'Unlimited'] },
                  { name: 'Team seats', values: ['1', '1', '5', 'Unlimited'] },
                  { name: 'Custom data sources', values: ['-', '-', '✓', '✓'] },
                  { name: 'White-label', values: ['-', '-', '-', '✓'] },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-dark-700">
                    <td className="p-4 font-medium">{row.name}</td>
                    {row.values.map((value, valueIndex) => (
                      <td
                        key={valueIndex}
                        className={`p-4 text-center ${
                          valueIndex === 2 ? 'bg-razer-green/5' : ''
                        }`}
                      >
                        {value === '✓' ? (
                          <span className="text-razer-green text-xl">✓</span>
                        ) : value === '-' ? (
                          <span className="text-gray-600">-</span>
                        ) : (
                          <span className="text-gray-300">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">
            Have questions about pricing?
          </p>
          <a
            href="#faq"
            className="text-razer-green hover:underline font-semibold"
          >
            Check our FAQ →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
