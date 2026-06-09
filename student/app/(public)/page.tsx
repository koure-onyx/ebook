// apps/student/app/(public)/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Flame } from 'lucide-react';
import { FadeIn, HeroProgressWheel, StatsBar, FeatureGrid, HowItWorks } from './HeroAnimated';

export const metadata: Metadata = {
  title: "Pakistan's Smartest Study Platform | Ace Your Boards",
  description:
    'AI explanations, past paper frequency tracking, and real progress monitoring for Punjab, FBISE, Karachi, and Sindh boards. Grade 9 and 10.',
};

// ── Main Page ─────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            🇵🇰 Built for Pakistani Students
          </div>
          <h1
            className="text-4xl lg:text-5xl font-bold text-primary-900 leading-tight mb-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Pakistan&apos;s Smartest
            <span className="block text-primary-600">Study Platform</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl">
            Grade 9–10 board exam prep with AI explanations, past paper frequency analysis,
            and real progress tracking. Punjab, Federal, and Sindh boards supported.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-xl font-medium text-base hover:bg-primary-700 transition-colors shadow-sm"
            >
              Start Exploring →
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-7 py-3.5 rounded-xl font-medium text-base hover:bg-gray-50 transition-colors"
            >
              Browse Topics
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-6">
          <HeroProgressWheel />
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm w-64">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Hot Topic — Lahore Board</p>
            <p className="font-semibold text-gray-900 text-sm">Vernier Callipers</p>
            <p className="text-xs text-gray-400 mt-0.5">Appeared 4 times in past 5 years</p>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <StatsBar />

      {/* FEATURE GRID */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-3">
              Everything You Need to Ace Your Boards
            </h2>
            <p className="text-slate-500">Built specifically for Pakistani board exam students</p>
          </div>
        </FadeIn>
        <FeatureGrid />
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-3">
                How It Works
              </h2>
            </div>
          </FadeIn>
          <HowItWorks />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2
          className="text-3xl font-bold text-primary-900 mb-4"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Ready to Ace Your Boards?
        </h2>
        <p className="text-gray-500 mb-8">Join thousands of Pakistani students studying smarter.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary-700 transition-colors shadow-md"
        >
          Open the Dashboard →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © 2026 StudyVault PK — Built for Pakistani Students 🇵🇰
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="/about" className="hover:text-slate-700 transition-colors">About</Link>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/contact" className="hover:text-slate-700 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
