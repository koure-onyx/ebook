import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Vault,
  Trophy,
  Settings,
  CreditCard,
  GraduationCap,
  Library,
  User,
  Sparkles,
  Users
} from 'lucide-react';

export type NavItem = {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  category: 'main' | 'learning' | 'account' | 'premium';
};

export const navigationMap: NavItem[] = [
  // Main Dashboard
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['student'],
    category: 'main'
  },

  // Learning Path
  {
    title: 'My Learning',
    path: '/learn',
    icon: BookOpen,
    roles: ['student'],
    category: 'learning'
  },
  {
    title: 'Books',
    path: '/books',
    icon: Library,
    roles: ['student'],
    category: 'learning'
  },
  {
    title: 'Programs',
    path: '/programs',
    icon: GraduationCap,
    roles: ['student'],
    category: 'learning'
  },

  // Quiz & Practice
  {
    title: 'Quiz Engine',
    path: '/quiz',
    icon: Brain,
    roles: ['student'],
    category: 'learning'
  },
  {
    title: 'AI Flashcards',
    path: '/flashcards',
    icon: Sparkles,
    roles: ['student'],
    category: 'learning'
  },

  // Knowledge Vault
  {
    title: 'Knowledge Vault',
    path: '/vault',
    icon: Vault,
    roles: ['student'],
    category: 'learning'
  },
  {
    title: 'My Vault',
    path: '/my-vault',
    icon: Vault,
    roles: ['student'],
    category: 'learning'
  },

  // Progress & Achievements
  {
    title: 'Progress',
    path: '/progress',
    icon: Trophy,
    roles: ['student'],
    category: 'account'
  },

  // Billing & Subscription
  {
    title: 'Billing',
    path: '/billing',
    icon: CreditCard,
    roles: ['student'],
    category: 'account'
  },
  {
    title: 'Premium',
    path: '/premium',
    icon: Sparkles,
    roles: ['student'],
    category: 'premium'
  },

  // Parent Portal
  {
    title: 'Parent Portal',
    path: '/parents',
    icon: Users,
    roles: ['student', 'parent'],
    category: 'account'
  },

  // Profile & Settings
  {
    title: 'Profile',
    path: '/profile',
    icon: User,
    roles: ['student', 'admin'],
    category: 'account'
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['student', 'admin'],
    category: 'account'
  }
];

export const getNavItemsByRole = (role: string): NavItem[] => {
  return navigationMap.filter(item => item.roles.includes(role));
};

export const getNavItemsByCategory = (category: string): NavItem[] => {
  return navigationMap.filter(item => item.category === category);
};

export const findNavItemByPath = (path: string): NavItem | undefined => {
  return navigationMap.find(item => path.startsWith(item.path));
};
