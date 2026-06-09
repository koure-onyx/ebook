'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, CreditCard, Smartphone, Shield, Zap, Lock } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  aiCreditsPerDay: number;
  popular?: boolean;
}

interface SubscriptionData {
  currentPlan: string;
  planName: string;
  isPremium: boolean;
  expiresAt: string | null;
  aiCreditsUsed: number;
  dailyLimit: number;
  features: string[];
  availablePlans: Plan[];
}

export default function PremiumPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ transactionId: string; plan: string } | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      // SECURE: No userId passed - server extracts from session/token
      const res = await fetch(`/api/checkout`);
      const data = await res.json();
      
      if (data.success) {
        setSubscription(data.data);
      } else {
        setError(data.error || 'Failed to load subscription data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!selectedPlan || !paymentMethod) return;

    setProcessing(true);
    setError(null);

    try {
      // SECURE: No userId passed - server extracts from session/token
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess({
          transactionId: data.data.transactionId,
          plan: data.data.subscription?.planName || data.data.plan,
        });
        // In production, redirect to payment gateway
        if (data.data.redirectUrl) {
          window.location.href = data.data.redirectUrl;
        }
      } else {
        setError(data.error || 'Checkout failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading premium plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upgrade to <span className="text-emerald-600">Premium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock unlimited AI explanations, advanced analytics, and exclusive features for Pakistani board exam success
          </p>
        </motion.div>

        {/* Current Plan Card */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-12 border-2 border-emerald-200"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Current Plan: {subscription.planName}
                </h2>
                {subscription.isPremium ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Active until {new Date(subscription.expiresAt!).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <p className="text-gray-600">Free plan with limited features</p>
                )}
              </div>
              {!subscription.isPremium && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">AI Credits Today</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {subscription.aiCreditsUsed} / {subscription.dailyLimit}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {subscription?.availablePlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                selectedPlan === plan.id 
                  ? 'ring-4 ring-emerald-500 scale-105' 
                  : 'hover:scale-105'
              } ${plan.popular ? 'border-2 border-emerald-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">Rs. {plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                {plan.aiCreditsPerDay === -1 ? (
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-semibold">Unlimited AI Credits</span>
                  </li>
                ) : (
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{plan.aiCreditsPerDay} AI Credits/Day</span>
                  </li>
                )}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan.id);
                }}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? 'bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Method Selection */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Choose Payment Method
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === 'easypaisa'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <Smartphone className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <p className="font-bold text-gray-900">EasyPaisa</p>
                  <p className="text-sm text-gray-600">Mobile Wallet</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === 'jazzcash'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <CreditCard className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <p className="font-bold text-gray-900">JazzCash</p>
                  <p className="text-sm text-gray-600">Mobile Wallet</p>
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <p className="font-bold text-emerald-900">Payment Initiated!</p>
                  </div>
                  <p className="text-sm text-emerald-700">Transaction ID: {success.transactionId}</p>
                  <p className="text-sm text-emerald-700">Plan: {success.plan}</p>
                  <p className="text-xs text-emerald-600 mt-2">
                    In production, you will be redirected to the payment gateway.
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={!paymentMethod || processing}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Pay Rs. {subscription?.availablePlans.find(p => p.id === selectedPlan)?.price} Now
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure payment powered by EasyPaisa & JazzCash</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6">
            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unlimited AI</h3>
            <p className="text-gray-600">Get instant explanations for any topic, anytime</p>
          </div>
          <div className="text-center p-6">
            <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">Trusted by thousands of Pakistani students</p>
          </div>
          <div className="text-center p-6">
            <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Anytime</h3>
            <p className="text-gray-600">No long-term commitments or hidden fees</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
