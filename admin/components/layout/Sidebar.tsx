'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { cn } from '../../lib/utils';
import type { NavItem } from '../../lib/navigation-map';

interface SidebarProps {
  navigationItems: NavItem[];
  session: Session | null;
  onClose?: () => void;
}

export function Sidebar({ navigationItems, session, onClose }: SidebarProps) {
  const pathname = usePathname();

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SV</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Study Vault</h1>
            <p className="text-xs text-text-muted">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {category}
            </h3>
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                        'transition-colors',
                        isActive
                          ? 'bg-accent text-text-primary font-medium'
                          : 'text-text-muted hover:bg-accent/50 hover:text-text-primary'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      {session?.user && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-bg-tertiary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">
                  {session.user.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-text-muted truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
