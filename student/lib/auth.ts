import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const authOptions: NextAuthOptions = {
  providers: [
    // ── TEMPORARY DEV PROVIDER — delete this block before production ──
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? []
      : [
          CredentialsProvider({
            id: 'dev-login',
            name: 'Dev Login (test only)',
            credentials: {
              email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
            },
            async authorize(credentials) {
              const email = credentials?.email || 'dev@studyvault.pk';
              try {
                const res = await fetch(`${API_URL}/auth/dev-login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, name: 'Dev User' }),
                });
                if (!res.ok) {
                  console.error('[dev-login] Backend responded:', res.status, await res.text());
                  return null;
                }
                const data = await res.json();
                const token = data.data?.tokens?.accessToken || data.data?.token;
                const user = data.data?.user;
                return { 
                  id: user?._id || email, 
                  email, 
                  name: user?.name || 'Dev User',
                  role: user?.role || 'student',
                  backendToken: token 
                };
              } catch (e) {
                console.error('[dev-login] Backend unreachable:', e);
                return null;
              }
            },
          }),
        ]),
    // ── END TEMPORARY DEV PROVIDER ─────────────────────────────────────

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: { params: { scope: 'openid email profile' } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile) {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: profile.sub,
              email: profile.email,
              name: profile.name,
              avatar: profile.picture,
            }),
          });

          if (!res.ok) {
            console.error('Backend auth failed:', await res.text());
            return false;
          }

          const data = await res.json();
          const user = data.data?.user;
          (account as any).backendToken = data.data?.tokens?.accessToken || data.data?.token || data.token;
          (account as any).userRole = user?.role || 'student';
          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account, user }) {
      if ((account as any)?.backendToken) {
        token.backendToken = (account as any).backendToken;
      }
      if ((user as any)?.backendToken) {
        token.backendToken = (user as any).backendToken;
      }
      // Store role in token
      if ((account as any)?.userRole) {
        token.role = (account as any).userRole;
      }
      if ((user as any)?.role) {
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.sub || '') as string;
      (session.user as any).token = token.backendToken;
      (session.user as any).role = token.role || 'student';
      return session;
    },
  },
  pages: {
    signIn: '/api/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
