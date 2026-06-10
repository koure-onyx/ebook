import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'StudyVault Admin - Content Management',
  description: 'Admin portal for managing textbooks, chapters, and topics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
