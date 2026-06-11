"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "../../lib/api/auth";
import {
  BookOpen,
  Search,
  Archive,
  BarChart2,
  Zap,
  Bell,
  User,
  LogOut,
  Settings,
  CreditCard,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  userXP?: number;
  notificationCount?: number;
}

export function Navbar({ userXP = 0, notificationCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Global ⌘K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
        window.dispatchEvent(new CustomEvent("studyvault-search-focus"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const navLinks = [
    { href: "/books", icon: BookOpen, label: "Books" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/my-vault", icon: Archive, label: "Vault" },
    { href: "/progress", icon: BarChart2, label: "Progress" },
    { href: "/quiz", icon: Zap, label: "Quizzes" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-200">
              <span className="text-white font-bold text-base">SV</span>
            </div>
            <span className="font-bold text-slate-900 hidden sm:inline-block tracking-tight">
              Study Vault
            </span>
          </Link>

          {/* CENTER: Nav Links (Desktop only) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-200 group ${
                    active
                      ? "text-emerald-600 bg-emerald-50/50 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[2]"}`}
                    />
                    <span className="text-sm">{link.label}</span>
                  </div>
                  {active && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4">
            {/* XP Chip */}
            <Link
              href="/progress"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <Zap className="w-4 h-4 fill-emerald-600" />
              <span>{userXP} XP</span>
            </Link>

            {/* Logout Button (Prominent) */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-slate-200 hover:border-red-100 font-bold text-sm active:scale-95 shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-emerald-700">
                    {getInitials(session?.user?.name, session?.user?.email)}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <p className="text-sm font-bold text-slate-900">
                          {session?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {session?.user?.email}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Settings
                        </Link>
                        <Link
                          href="/billing"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          Billing
                        </Link>
                      </div>

                      <div className="p-2 bg-slate-50 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100/50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
