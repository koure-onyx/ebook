'use client';

import React from 'react';
import './DesktopLayout.css';

interface DesktopLayoutProps {
  sidebar?: React.ReactNode;
  main: React.ReactNode;
  topbar?: React.ReactNode;
  className?: string;
}

export function DesktopLayout({
  sidebar,
  main,
  topbar,
  className = '',
}: DesktopLayoutProps) {
  return (
    <div className={`desktop-layout ${className}`}>
      {sidebar && <aside className="desktop-sidebar">{sidebar}</aside>}
      <div className="desktop-content-wrapper">
        {topbar && <header className="desktop-topbar">{topbar}</header>}
        <main className="desktop-main">{main}</main>
      </div>
    </div>
  );
}

export default DesktopLayout;
