'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingProvider } from './LoadingProvider';
import { Sidebar } from './Sidebar';
import { navigationMap } from '../../lib/navigation-map';

interface AppShellProps {
  children: ReactNode;
  title?: string;
}

function AuthLoadingState() {
  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted">Loading Admin Portal...</p>
      </div>
    </div>
  );
}

function ShellContent({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading state while checking auth
  if (status === 'loading') {
    return <AuthLoadingState />;
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex">
      {/* Desktop Sidebar */}
      <AnimatePresence>
        {!isMobile && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-screen border-r bg-bg-primary overflow-hidden"
          >
            <Sidebar navigationItems={navigationMap} session={session} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-bg-primary z-50 border-r"
            >
              <Sidebar 
                navigationItems={navigationMap} 
                session={session} 
                onClose={() => setSidebarOpen(false)} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b">
            <div className="flex items-center justify-between h-14 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-accent rounded-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-semibold text-sm">Admin Portal</span>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <LoadingProvider>
      <ShellContent>{children}</ShellContent>
    </LoadingProvider>
  );
}

export default AppShell;
