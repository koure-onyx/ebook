"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Home,
  BookOpen,
  Brain,
  Trophy,
  User,
  LogIn,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Home",
    authRequired: false,
  },
  {
    href: "/learn",
    icon: BookOpen,
    label: "Learn",
    authRequired: true,
  },
  {
    href: "/quiz",
    icon: Brain,
    label: "Quiz",
    authRequired: true,
  },
  {
    href: "/vault",
    icon: Trophy,
    label: "Vault",
    authRequired: true,
  },
  {
    href: "/profile",
    icon: User,
    label: "Profile",
    authRequired: true,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          // Hide auth-required items if not authenticated
          if (item.authRequired && status === "unauthenticated") {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-stone-100"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                {status === "loading" && item.authRequired ? (
                  <div className="w-5 h-5 rounded-full bg-stone-200 animate-pulse" />
                ) : status === "unauthenticated" && item.href === "/dashboard" ? (
                  <LogIn className="w-5 h-5 text-stone-400" />
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-stone-900" : "text-stone-400"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                )}
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-stone-900" : "text-stone-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
