"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Search,
  Archive,
  MoreHorizontal,
  BarChart2,
  Zap,
  User,
  LogOut,
  X,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface MobileTabBarProps {
  userXP?: number;
}

export function MobileTabBar({ userXP = 0 }: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/books", icon: BookOpen, label: "Books" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/vault", icon: Archive, label: "Vault" },
  ];

  const moreLinks = [
    { href: "/progress", icon: BarChart2, label: "Progress" },
    { href: "/quizzes", icon: Zap, label: "Quizzes" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Top Bar (Mobile) */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs">SV</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">Study Vault</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* XP Chip */}
            <Link
              href="/progress"
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
            >
              <Zap className="w-3.5 h-3.5 fill-emerald-600" />
              <span>{userXP}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center w-full h-full"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-emerald-50"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon
                    className={`w-6 h-6 ${
                      active ? "text-emerald-600 stroke-[2.5]" : "text-slate-400 stroke-[2]"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium ${
                      active ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* More Tab */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="relative flex flex-col items-center justify-center w-full h-full"
          >
            <div className="flex flex-col items-center gap-1">
              <MoreHorizontal className="w-6 h-6 text-slate-400 stroke-[2]" />
              <span className="text-[11px] font-medium text-slate-400">More</span>
            </div>
          </button>
        </div>
      </nav>

      {/* More Sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsMoreOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900">More</h3>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="py-2">
                {moreLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 ${
                        active ? "bg-emerald-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          active
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`font-medium ${
                          active ? "text-emerald-700" : "text-slate-700"
                        }`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Sign Out */}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-red-600">Sign Out</span>
                </button>
              </div>

              <div className="h-8" /> {/* Safe area spacer */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
