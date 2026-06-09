'use client';

import React from 'react';
import './MobileLayout.css';

interface MobileLayoutProps {
  header?: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function MobileLayout({
  header,
  main,
  footer,
  className = '',
}: MobileLayoutProps) {
  return (
    <div className={`mobile-layout ${className}`}>
      {header && <header className="mobile-header">{header}</header>}
      <main className="mobile-main">{main}</main>
      {footer && <footer className="mobile-footer">{footer}</footer>}
    </div>
  );
}

export default MobileLayout;
