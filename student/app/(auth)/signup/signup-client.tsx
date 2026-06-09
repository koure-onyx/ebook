'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignupClient() {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignUp() {
    setLoading(true)
    // Google OAuth creates account on first sign in via NextAuth callbacks
    await signIn('google', { callbackUrl: '/onboarding' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-lg">SV</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
        <p className="text-slate-500 text-sm mb-8">
          Free to start. No credit card needed.
        </p>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-60 min-h-[48px]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          {loading ? 'Creating account...' : 'Sign up with Google'}
        </button>

        <p className="text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
