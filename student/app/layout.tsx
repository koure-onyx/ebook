import type { Metadata } from 'next';
import './globals.css';
import '../styles/quran-text.css';
import { Providers } from "../components/Providers"; // Double-check this path matches your structure



export const metadata: Metadata = {
  title: { default: 'StudyVault PK', template: '%s | StudyVault PK' },
  description: "Pakistan's smartest board exam prep platform",
};

import { SessionProvider } from 'next-auth/react';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="font-body bg-white text-gray-900 antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}