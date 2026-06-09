// apps/student/app/(public)/HeroAnimated.tsx
"use client";

import { motion } from "framer-motion";
import { Flame, Star, Check, ArrowRight, BookOpen, Building2, Sparkles, FileText } from "lucide-react";

interface HeroAnimatedProps {
  children: React.ReactNode;
}

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function HeroProgressWheel() {
  const percent = 72;
  const r = 48;
  const circ = 2 * Math.PI * r;
  const filled = (percent / 100) * circ;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      <div className="absolute inset-0 -z-10 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col items-center">
          <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="#059669"
              strokeWidth="12"
              strokeDasharray={`${filled} ${circ}`}
              strokeDashoffset={circ / 4}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
            <text
              x="80"
              y="74"
              textAnchor="middle"
              fontSize="24"
              fontWeight="700"
              fill="#0F172A"
            >
              {percent}%
            </text>
            <text
              x="80"
              y="96"
              textAnchor="middle"
              fontSize="11"
              fill="#64748B"
            >
              Readiness
            </text>
          </svg>

          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            On Track for Boards
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ExamReadinessCard() {
  const percent = 87;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (percent / 100) * circ;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
    >
      {/* Circular Progress Ring */}
      <div className="flex justify-center mb-4">
        <div className="relative inline-flex flex-col items-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="12"
            />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="#059669"
              strokeWidth="12"
              strokeDasharray={`${filled} ${circ}`}
              strokeDashoffset={circ / 4}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            <text
              x="70"
              y="66"
              textAnchor="middle"
              fontSize="22"
              fontWeight="bold"
              fill="#0A2540"
            >
              {percent}%
            </text>
            <text
              x="70"
              y="85"
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
            >
              Exam Ready
            </text>
          </svg>
        </div>
      </div>

      {/* Topic Mastered Badge */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <Star className="w-3 h-3 fill-current" />
          Topic Mastered
        </span>
      </div>

      {/* Hot Topic Card */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-xs text-amber-700 mb-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Hot Topic — Lahore Board
        </p>
        <p className="font-semibold text-slate-900 text-sm">Vernier Callipers</p>
        <p className="text-xs text-amber-700 mt-1">
          Appeared 4× in past 5 years — likely to repeat
        </p>
      </div>
    </motion.div>
  );
}

export function StatsBar() {
  const stats = [
    { icon: BookOpen, value: "500+", label: "Topics Live", color: "text-emerald-600" },
    { icon: Building2, value: "5", label: "Boards Supported", color: "text-blue-600" },
    { icon: Sparkles, value: "AI", label: "Powered Explanations", color: "text-purple-600" },
    { icon: FileText, value: "Past", label: "Papers Included", color: "text-amber-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-slate-50 py-8"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className="flex flex-col items-center gap-1"
            >
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs text-slate-500 text-center">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function FeatureGrid() {
  const features = [
    {
      icon: Flame,
      title: "Exam Frequency",
      desc: "See which topics appear most in Lahore, FBISE, and Karachi past papers. Never waste time on low-yield topics.",
    },
    {
      icon: Star,
      title: "AI Explain",
      desc: "Tap any topic and get a simple English explanation instantly. No jargon. Just clear answers.",
    },
    {
      icon: Check,
      title: "Progress Wheel",
      desc: "Your personal exam readiness score updates as you study. Know exactly how prepared you are.",
    },
    {
      icon: ArrowRight,
      title: "Study Vault",
      desc: "Save flashcards, YouTube links, and highlights. Your personal revision library, always ready.",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.07 },
        },
      }}
      className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <feature.icon className="w-7 h-7 text-emerald-600 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Choose Your Board & Subject",
      desc: "Select Punjab, FBISE, Karachi, or Sindh. Pick Grade 9 or 10. Pick your subject. Done in 30 seconds.",
    },
    {
      number: "2",
      title: "Read, Practice, and Learn",
      desc: "Study topics with AI explanations, MCQs, and chapter summaries. Each topic is bite-sized and exam-focused.",
    },
    {
      number: "3",
      title: "Track Your Mastery",
      desc: "Score 80%+ on a quiz to mark a topic Mastered. Watch your exam readiness wheel fill up.",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className="space-y-8"
    >
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          variants={{
            hidden: { opacity: 0, x: -12 },
            show: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.4 }}
          className="flex gap-4 items-start"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
            {step.number}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
