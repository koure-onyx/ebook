import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

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
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
              try {
                const res = await fetch(`${apiUrl}/auth/dev-login`, {
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
                return { id: email, email, name: 'Dev User', backendToken: token };
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/google`, {
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
          (account as any).backendToken = data.data?.tokens?.accessToken || data.data?.token || data.token;
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
      // dev-login puts backendToken directly on user
      if ((user as any)?.backendToken) {
        token.backendToken = (user as any).backendToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.sub || '') as string;
      (session.user as any).token = token.backendToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
