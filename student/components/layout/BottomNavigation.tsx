'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Vault, User } from 'lucide-react';
import './BottomNavigation.css';

const navItems = [
  { id: 'home', label: 'Home', href: '/dashboard', icon: Home },
  { id: 'books', label: 'Books', href: '/books', icon: BookOpen },
  { id: 'vault', label: 'Vault', href: '/my-vault', icon: Vault },
  { id: 'profile', label: 'Profile', href: '/profile', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname?.includes('/dashboard')) return 'home';
    if (pathname?.includes('/books')) return 'books';
    if (pathname?.includes('/my-vault')) return 'vault';
    if (pathname?.includes('/profile')) return 'profile';
    return 'home';
  };
  
  const activeTab = getActiveTab();
  
  return (
    <nav className="bottom-navigation" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-icon-wrapper">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className="nav-icon"
                />
              </div>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
