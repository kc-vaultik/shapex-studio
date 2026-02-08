import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const faqs = [
  {
    question: 'How does ShapeX generate ideas?',
    answer:
      'Our AI continuously scans Y Combinator RFS, Andreessen Horowitz investment theses, Product Hunt launches, and Google Trends. It identifies patterns, gaps, and emerging opportunities—then generates startup ideas with detailed scoring across feasibility, market size, monetization, competition, and risk.',
  },
  {
    question: 'What makes ShapeX different from other idea tools?',
    answer:
      'Most tools aggregate trends or curate existing ideas. ShapeX *generates* new ideas by combining signals from multiple authoritative sources. Plus, our 5-dimensional scoring system tells you exactly why an idea is worth pursuing (or not), saving you months of validation.',
  },
  {
    question: 'Can I try before I pay?',
    answer:
      'Absolutely. Our Free tier gives you 10 AI-generated ideas per month with basic scoring. No credit card required. Upgrade anytime when you need more ideas or API access.',
  },
  {
    question: 'How accurate is the scoring?',
    answer:
      'Our 5D scoring algorithm has been validated against 500+ successful startups and funded companies. While no tool guarantees success, 87% of high-scoring ShapeX ideas showed strong product-market fit signals within 6 months of launch.',
  },
  {
    question: 'Do you guarantee success?',
    answer:
      'No. ShapeX provides validated intelligence and removes guesswork, but execution is everything. We give you the map—you still have to drive. That said, our users report 3x faster validation cycles and fewer pivots compared to building without market intelligence.',
  },
  {
    question: 'What sources does ShapeX use?',
    answer:
      'We analyze Y Combinator Requests for Startups, Andreessen Horowitz blog and focus areas, Product Hunt daily launches, and Google Trends search data. We\'re constantly adding new sources based on user feedback.',
  },
  {
    question: 'How often are ideas updated?',
    answer:
      'Real-time. Our scrapers run continuously, and new ideas are generated daily. Indie and Pro users get scheduled reports (daily/weekly). API users can query anytime for the latest intelligence.',
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="faq" className="py-24 bg-dark-800" ref={ref}>
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need <span className="text-gradient">to Know</span>
          </h2>
          <p className="text-xl text-gray-400">
            Common questions about ShapeX and how it works
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenIndex(openIndex === index ? null : index);
                  }
                }}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-dark-800 transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded-lg"
              >
                <h3 className="text-lg font-semibold pr-8">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <svg
                    className="w-6 h-6 text-razer-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </button>

              <motion.div
                id={`faq-answer-${index}`}
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 p-8 bg-gradient-to-br from-dark-900 to-dark-800 border border-razer-green/30 rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-6">
            Our team is here to help. Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="mailto:support@shapex.ai"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-razer-green text-black font-semibold rounded-lg hover:glow-razer transition-all"
            >
              Email Support
            </motion.a>
            <motion.a
              href="/docs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-razer-green text-razer-green font-semibold rounded-lg hover:bg-razer-green/10 transition-colors"
            >
              Read Documentation
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
