import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
  Brain,
  Shield,
  Upload,
  Library
} from 'lucide-react';

export type NavItem = {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  category: 'main' | 'content' | 'users' | 'settings' | 'ingestion';
};

export const navigationMap: NavItem[] = [
  // Main Dashboard
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['admin'],
    category: 'main'
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    roles: ['admin'],
    category: 'main'
  },
  
  // Content Management
  {
    title: 'Books',
    path: '/books',
    icon: Library,
    roles: ['admin'],
    category: 'content'
  },
  {
    title: 'Chapters',
    path: '/chapters',
    icon: FileText,
    roles: ['admin'],
    category: 'content'
  },
  {
    title: 'Topics',
    path: '/topics',
    icon: Brain,
    roles: ['admin'],
    category: 'content'
  },
  {
    title: 'Courses',
    path: '/courses',
    icon: BookOpen,
    roles: ['admin'],
    category: 'content'
  },
  
  // AI Ingestion
  {
    title: 'AI Ingestion',
    path: '/books/ingest',
    icon: Upload,
    roles: ['admin'],
    category: 'ingestion'
  },
  
  // User Management
  {
    title: 'Users',
    path: '/users',
    icon: Users,
    roles: ['admin'],
    category: 'users'
  },
  {
    title: 'Roles & Permissions',
    path: '/roles',
    icon: Shield,
    roles: ['admin'],
    category: 'users'
  },
  
  // Settings
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['admin'],
    category: 'settings'
  }
];

export const getNavItemsByCategory = (category: string): NavItem[] => {
  return navigationMap.filter(item => item.category === category);
};

export const findNavItemByPath = (path: string): NavItem | undefined => {
  return navigationMap.find(item => path.startsWith(item.path));
};
