'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import './TopNavigation.css';

interface TopNavigationProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopNavigation({ title, showBack = false, onBack }: TopNavigationProps) {
  return (
    <header className="top-navigation" role="banner">
      <div className="top-nav-container">
        <div className="top-nav-left">
          {showBack && (
            <button
              onClick={onBack}
              className="back-button"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          
          <Link href="/dashboard" className="brand-logo">
            StudyVault PK
          </Link>
        </div>
        
        <div className="top-nav-right">
          <button className="icon-button" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-badge" aria-label="3 unread notifications">3</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNavigation;
