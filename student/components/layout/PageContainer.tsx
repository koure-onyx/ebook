'use client';

import React from 'react';
import './PageContainer.css';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  actions?: React.ReactNode[];
  className?: string;
  scrollable?: boolean;
}

export function PageContainer({
  children,
  title,
  actions = [],
  className = '',
  scrollable = true,
}: PageContainerProps) {
  return (
    <article className={`page-container ${className}`} data-scrollable={scrollable}>
      {(title || actions?.length > 0) && (
        <header className="page-header">
          <div className="page-header-content">
            {title && <h1 className="page-title">{title}</h1>}
            {actions?.length > 0 && (
              <div className="page-actions">
                {actions.map((action, index) => (
                  <React.Fragment key={index}>{action}</React.Fragment>
                ))}
              </div>
            )}
          </div>
        </header>
      )}
      
      <div className="page-content">
        {children}
      </div>
    </article>
  );
}

export default PageContainer;
