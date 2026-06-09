'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Skip breadcrumb on root paths
  if (pathname === '/' || pathname === '/dashboard') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const items: BreadcrumbItem[] = [];
  let accumulatedPath = '';
  
  // Add home link
  items.push({ label: 'Home', href: '/dashboard' });
  
  // Process each segment
  segments.forEach((segment, index) => {
    // Skip auth and dashboard segments for cleaner breadcrumbs
    if (segment === '(dashboard)' || segment === '(auth)') {
      return;
    }
    
    accumulatedPath += `/${segment}`;
    
    // Decode and format the segment label
    let label = decodeURIComponent(segment);
    
    // Handle dynamic route segments - convert to readable format
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const paramName = segment.slice(1, -1);
      // For dynamic segments, we'll use a generic label since we don't have the actual value
      label = paramName.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
    } else {
      // Format regular segments
      label = label.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    
    // Truncate long labels
    if (label.length > 20) {
      label = label.substring(0, 17) + '...';
    }
    
    items.push({ label, href: accumulatedPath });
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground px-4 py-2 bg-muted/30 rounded-lg mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            )}
            
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded-md transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
