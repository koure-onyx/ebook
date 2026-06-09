import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import '../styles/quran-text.css';

export const metadata: Metadata = {
  title: { default: 'StudyVault PK', template: '%s | StudyVault PK' },
  description: "Pakistan's smartest board exam prep platform",
};

import { Providers } from '@/components/Providers';

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      style={{ '--font-quran': 'serif' } as CSSProperties}
      suppressHydrationWarning
    >
      <body className="font-body bg-white text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
