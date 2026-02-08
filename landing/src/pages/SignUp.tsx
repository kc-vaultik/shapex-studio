import { motion } from 'framer-motion';
import { useState } from 'react';
import { registerUser } from '../utils/api';
import Footer from '../components/Footer';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser(email, tier);
      setSuccess(true);
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-24 pb-12 bg-dark-900 flex items-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <div className="p-8 bg-dark-800 border border-dark-700 rounded-2xl">
              <h1 className="text-4xl font-bold mb-2 text-center">
                Start Your <span className="text-gradient">Free Trial</span>
              </h1>
              <p className="text-gray-400 text-center mb-8">
                No credit card required. Get started in seconds.
              </p>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-6xl mb-4">✓</div>
                  <h2 className="text-2xl font-bold mb-4 text-razer-green">
                    Welcome to ShapeX!
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Check your email for your API key and getting started guide.
                  </p>
                  <motion.a
                    href="/docs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block px-6 py-3 bg-razer-green text-black font-semibold rounded-lg"
                  >
                    View Documentation
                  </motion.a>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg focus:outline-none focus:border-razer-green transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Choose Your Plan
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'free', label: 'Free', price: '$0/mo' },
                        { value: 'indie', label: 'Indie', price: '$29/mo' },
                        { value: 'pro', label: 'Pro', price: '$99/mo' },
                      ].map((plan) => (
                        <label
                          key={plan.value}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            tier === plan.value
                              ? 'border-razer-green bg-razer-green/10'
                              : 'border-dark-700 hover:border-dark-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tier"
                            value={plan.value}
                            checked={tier === plan.value}
                            onChange={(e) => setTier(e.target.value)}
                            className="mr-4"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{plan.label}</div>
                            <div className="text-sm text-gray-400">
                              {plan.price}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-razer-green text-black font-bold rounded-lg hover:glow-razer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Start Free Trial'}
                  </motion.button>

                  <p className="text-center text-sm text-gray-500">
                    By signing up, you agree to our{' '}
                    <a href="/terms" className="text-razer-green hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="text-razer-green hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </form>
              )}
            </div>

            <p className="text-center text-gray-500 mt-6">
              Already have an account?{' '}
              <a href="/signin" className="text-razer-green hover:underline">
                Sign In
              </a>
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
