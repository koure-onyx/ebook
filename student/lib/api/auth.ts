// Auth utilities - Google OAuth only (no login/signup)
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  avatar?: string;
  onboardingCompleted?: boolean;
  token?: string;
}

// Re-export from next-auth/react
export { SessionProvider } from 'next-auth/react';
export { useSession, signIn, signOut } from 'next-auth/react';
