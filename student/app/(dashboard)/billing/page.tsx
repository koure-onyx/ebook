'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { CheckCircle, Sparkles, Crown, Zap, Shield, Gift } from 'lucide-react';

// ============================================================================
// SPRING PRESETS (from syntax-enforcer.md)
// ============================================================================
const softCardSpring = { stiffness: 100, damping: 15, mass: 1.0 };
const tapSpring = { stiffness: 400, damping: 15, mass: 0.8 };
const floatSpring = { stiffness: 300, damping: 25, mass: 0.8 };

// ============================================================================
// PLAN DATA
// ============================================================================
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'PKR',
    features: ['5 AI credits/day', 'Basic progress tracking', 'Limited vault storage'],
    popular: false,
    color: 'hsl(0, 0%, 60%)',
    icon: Gift,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    currency: 'PKR',
    period: 'month',
    features: ['50 AI credits/day', 'Full progress analytics', 'Unlimited vault', 'Email support'],
    popular: true,
    color: 'hsl(270, 90%, 60%)',
    icon: Zap,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    currency: 'PKR',
    period: 'month',
    features: ['Unlimited AI credits', 'Advanced analytics', 'Priority support', 'Family sharing (up to 4)', 'Early access features'],
    popular: false,
    color: 'hsl(45, 100%, 50%)',
    icon: Crown,
  },
];

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================
const BillingEmptyState: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(135deg, hsl(270, 90%, 60%) 0%, hsl(45, 100%, 50%) 100%)',
          }}
        />

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 opacity-20"
        >
          <Sparkles size={64} stroke="hsl(270, 90%, 60%)" />
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-40 right-10 opacity-20"
        >
          <Crown size={48} stroke="hsl(45, 100%, 50%)" />
        </motion.div>

        <div className="relative z-10 px-6 py-16 text-center">
          {/* Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, ...softCardSpring }}
            className="mx-auto mb-8 w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(270, 90%, 60%) 0%, hsl(45, 100%, 50%) 100%)',
            }}
          >
            <Crown size={64} stroke="white" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Unlock Your Full Potential
          </h1>
          <p className="text-lg text-text-secondary max-w-md mx-auto mb-8">
            Upgrade to Premium and get unlimited AI credits, advanced analytics, 
            and priority support for your learning journey.
          </p>

          {/* Current Plan Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-tertiary border"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Gift size={16} stroke="var(--color-text-muted)" />
            <span className="text-sm font-medium text-text-secondary">
              Current Plan: Free
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="px-6 pb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl font-semibold text-text-primary text-center mb-8"
        >
          Choose Your Plan
        </motion.h2>

        <div className="grid gap-4 max-w-lg mx-auto">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, ...softCardSpring }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id ? 'border-primary bg-bg-secondary' : 'border-border'
                }`}
                style={{
                  backgroundColor: selectedPlan === plan.id ? 'var(--color-bg-secondary)' : undefined,
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, ...tapSpring }}
                    className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, hsl(270, 90%, 60%) 0%, hsl(45, 100%, 50%) 100%)',
                      color: 'white',
                    }}
                  >
                    Most Popular
                  </motion.div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: plan.color }}
                  >
                    <Icon size={24} stroke="white" strokeWidth={1.5} />
                  </div>

                  {/* Plan Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-text-primary">
                        {plan.price === 0 ? 'Free' : `${plan.price}${plan.currency}`}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-text-muted">
                          /{plan.period}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <CheckCircle size={16} stroke="var(--color-success)" className="flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={tapSpring}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <CheckCircle size={16} stroke="var(--color-text-inverse)" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-lg mx-auto"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={tapSpring}
            disabled={!selectedPlan || selectedPlan === 'free'}
            onClick={() => {
              // TODO: Implement checkout flow
              console.log('Upgrade to:', selectedPlan);
            }}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg ${
              selectedPlan && selectedPlan !== 'free'
                ? 'bg-primary text-text-inverse'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            }`}
            style={{
              backgroundColor: selectedPlan && selectedPlan !== 'free' 
                ? 'var(--color-primary)' 
                : 'var(--color-bg-tertiary)',
              color: selectedPlan && selectedPlan !== 'free'
                ? 'var(--color-text-inverse)'
                : 'var(--color-text-muted)',
            }}
          >
            {selectedPlan === 'free' 
              ? 'You\'re on the Free Plan' 
              : selectedPlan 
                ? `Upgrade to ${PLANS.find(p => p.id === selectedPlan)?.name}`
                : 'Select a Plan'}
          </motion.button>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted"
          >
            <Shield size={16} />
            <span>Secure payment • Cancel anytime</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BillingEmptyState;
