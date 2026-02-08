import { motion } from 'framer-motion';
import Footer from '../components/Footer';

export default function Docs() {
  return (
    <>
      <div className="min-h-screen pt-24 pb-12 bg-dark-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12">
              Everything you need to get started with ShapeX
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Getting Started',
                  description: 'Quick start guide and installation instructions',
                  icon: '🚀',
                },
                {
                  title: 'API Reference',
                  description: 'Complete API documentation with examples',
                  icon: '📚',
                },
                {
                  title: 'Integration Guides',
                  description: 'Learn how to integrate ShapeX with your workflow',
                  icon: '🔧',
                },
              ].map((section, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-8 bg-dark-800 border border-dark-700 rounded-2xl cursor-pointer"
                >
                  <div className="text-4xl mb-4">{section.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-razer-green">
                    {section.title}
                  </h3>
                  <p className="text-gray-400">{section.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-dark-800 border border-dark-700 rounded-2xl">
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-razer-green">
                    1. Sign Up
                  </h3>
                  <p className="text-gray-400">
                    Create a free account to get started. No credit card required.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-razer-green">
                    2. Get API Key
                  </h3>
                  <p className="text-gray-400 mb-3">
                    Generate your API key from the dashboard.
                  </p>
                  <div className="p-4 bg-dark-900 rounded-lg font-mono text-sm">
                    <span className="text-gray-500">$ </span>
                    <span className="text-razer-green">export</span>
                    <span className="text-gray-300"> SHAPEX_API_KEY=</span>
                    <span className="text-gray-500">"your-api-key"</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-razer-green">
                    3. Make Your First Request
                  </h3>
                  <p className="text-gray-400 mb-3">
                    Fetch top-scoring ideas using the API.
                  </p>
                  <div className="p-4 bg-dark-900 rounded-lg font-mono text-sm">
                    <div className="text-gray-500">// Install SDK</div>
                    <div className="text-gray-300 mb-2">
                      <span className="text-gray-500">$ </span>
                      <span className="text-razer-green">npm install</span>
                      <span> shapex-sdk</span>
                    </div>
                    <div className="text-gray-500 mt-4">// Fetch ideas</div>
                    <div className="text-razer-green">
                      import {'{'}ShapeX{'}'} from 'shapex-sdk';
                    </div>
                    <div className="text-gray-300 mt-2">
                      const shapex = new ShapeX(apiKey);
                    </div>
                    <div className="text-gray-300">
                      const ideas = await shapex.ideas.list({'{'}limit: 10{'}'});
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
