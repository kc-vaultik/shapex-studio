import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-razer-green to-emerald-400 rounded-lg" />
            <span className="text-xl font-bold text-gradient">ShapeX</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/studio" className="hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded font-semibold">
              Try Studio
            </Link>
            <a href="#features" className="hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded">
              Features
            </a>
            <a href="#pricing" className="hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded">
              Pricing
            </a>
            <a href="#ideas" className="hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded">
              Sample Ideas
            </a>
            <a href="#faq" className="hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded">
              FAQ
            </a>
            <a href="/docs" className="hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded">
              Docs
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 text-razer-green border border-razer-green rounded-lg hover:bg-razer-green/10 transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-razer-green text-black font-semibold rounded-lg hover:glow-razer transition-all focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Start Free
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="md:hidden text-white focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 space-y-4"
          >
            <a
              href="#features"
              className="block hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#ideas"
              className="block hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Sample Ideas
            </a>
            <a
              href="#faq"
              className="block hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </a>
            <a
              href="/docs"
              className="block hover:text-razer-green transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2 rounded"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              <button className="px-6 py-2 text-razer-green border border-razer-green rounded-lg hover:bg-razer-green/10 transition-colors focus-visible:outline-2 focus-visible:outline-razer-green focus-visible:outline-offset-2">
                Sign In
              </button>
              <button className="px-6 py-2 bg-razer-green text-black font-semibold rounded-lg hover:glow-razer transition-all focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2">
                Start Free
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
