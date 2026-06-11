'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { cn } from '../../lib/utils';
import { navigationMap, type NavItem } from '../../lib/navigation-map';
import { LogOut, LayoutDashboard, Library, FileText, Brain, BookOpen, Upload, Users, Shield, Settings } from 'lucide-react';

interface SidebarProps {
  session: Session | null;
  onClose?: () => void;
}

export function Sidebar({ session, onClose }: SidebarProps) {
  const pathname = usePathname();

  const groupedItems = navigationMap.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="flex flex-col h-full bg-white border-r w-64 shadow-sm">
      {/* Logo Area */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <span className="text-white font-bold text-lg">SV</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">Study Vault</h1>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">
              {category}
            </h3>
            <ul className="space-y-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      {session?.user && (
        <div className="p-4 border-t bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden ring-2 ring-white">
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name || 'U'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  <span className="text-sm font-bold">
                    {session.user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {session.user.name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-md shadow-red-100 group active:scale-95"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
