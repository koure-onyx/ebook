import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import '../styles/quran-text.css';

const quranFont = localFont({
  src: '../public/fonts/quran/UthmanicHafs1Ver18.woff2',
  variable: '--font-quran',
  display: 'block',
  preload: true,
  fallback: ['serif'],
});

export const metadata: Metadata = {
  title: { default: 'StudyVault PK', template: '%s | StudyVault PK' },
  description: "Pakistan's smartest board exam prep platform",
};

import { Providers } from '@/components/Providers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={quranFont.variable} suppressHydrationWarning>
      <body className="font-body bg-white text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
