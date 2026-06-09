import {
  BookOpen,
  Zap,
  Globe2,
  Moon,
  Calculator,
  Languages,
  Microscope,
  Atom,
  type LucideIcon,
} from "lucide-react";

export interface SubjectConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

/**
 * Subject to icon/color mapping — centralized configuration
 * Add new subjects here instead of hardcoding in components
 */
export const SUBJECT_ICON_MAP: Record<string, SubjectConfig> = {
  Physics: { icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  English: { icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "Pakistan Studies": {
    icon: Globe2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  Quran: { icon: Moon, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  Mathematics: {
    icon: Calculator,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  Chemistry: { icon: Atom, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  Biology: {
    icon: Microscope,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  Urdu: { icon: Languages, color: "text-rose-500", bgColor: "bg-rose-500/10" },
};

export const DEFAULT_SUBJECT_CONFIG: SubjectConfig = {
  icon: BookOpen,
  color: "text-slate-400",
  bgColor: "bg-slate-500/10",
};

/**
 * Get subject config by slug (lowercase, hyphenated)
 * Useful when book.subject_slug is available but book.subject is not
 */
export function getSubjectConfigBySlug(slug: string): SubjectConfig {
  const slugToSubject: Record<string, string> = {
    physics: "Physics",
    english: "English",
    "pakistan-studies": "Pakistan Studies",
    quran: "Quran",
    mathematics: "Mathematics",
    chemistry: "Chemistry",
    biology: "Biology",
    urdu: "Urdu",
  };
  
  const subjectName = slugToSubject[slug.toLowerCase()];
  return subjectName ? SUBJECT_ICON_MAP[subjectName] : DEFAULT_SUBJECT_CONFIG;
}

/**
 * Get all available subjects for filter dropdowns
 * Derives options from the actual mapping, not hardcoded strings
 */
export function getAvailableSubjects(): Array<{ name: string; slug: string }> {
  return Object.keys(SUBJECT_ICON_MAP).map((name) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  }));
}
