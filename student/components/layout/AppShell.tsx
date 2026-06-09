"use client";

import { ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingProvider } from "./LoadingProvider";
import { Navbar } from "../navigation/Navbar";
import { MobileTabBar } from "../navigation/MobileTabBar";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

function DesktopHeader({ session }: { session: any }) {
  const userXP = session?.user?.student_profile?.xp || 0;
  const notificationCount = 0; // TODO: Fetch from API

  return (
    <Navbar userXP={userXP} notificationCount={notificationCount} />
  );
}

function ShellContent({ children, title }: { children: ReactNode; title?: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block">
        <DesktopHeader title={title} session={session} />
      </div>

      {/* Mobile Header - Simplified */}
      <div className="md:hidden">
        <MobileTabBar userXP={session?.user?.student_profile?.xp || 0} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children, title, showHeader = true }: AppShellProps) {
  return (
    <LoadingProvider>
      <ShellContent title={title}>
        {children}
      </ShellContent>
    </LoadingProvider>
  );
}
