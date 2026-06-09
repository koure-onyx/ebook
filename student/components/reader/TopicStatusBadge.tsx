import { CheckCircle, BookOpen, Flame } from "lucide-react";

interface TopicStatusBadgeProps {
  isRead?: boolean;
  quizScore?: number;
  examFrequencyCount?: number;
  showTooltip?: boolean;
}

export function TopicStatusBadge({
  isRead = false,
  quizScore,
  examFrequencyCount = 0,
  showTooltip = true,
}: TopicStatusBadgeProps) {
  const isMastered = quizScore !== undefined && quizScore >= 80;
  const isHighFrequency = examFrequencyCount >= 3;

  // Don't render anything if no status
  if (!isRead && !isMastered && !isHighFrequency) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Mastery Badge - Highest Priority */}
      {isMastered && (
        <div
          className="flex items-center gap-1"
          title={showTooltip ? "Mastered (80%+ on quiz)" : ""}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          <span className="text-xs font-medium text-emerald-700 hidden sm:inline">
            Mastered
          </span>
        </div>
      )}

      {/* In Progress Badge - Only if not mastered */}
      {!isMastered && isRead && (
        <div
          className="flex items-center gap-1"
          title={showTooltip ? "Currently reading" : ""}
        >
          <BookOpen className="w-4 h-4 text-blue-600 fill-blue-100" />
          <span className="text-xs font-medium text-blue-700 hidden sm:inline">
            Reading
          </span>
        </div>
      )}

      {/* High Frequency Badge - Always show if applicable */}
      {isHighFrequency && (
        <div
          className="flex items-center gap-1"
          title={showTooltip ? `Appeared ${examFrequencyCount}× in past papers` : ""}
        >
          <Flame className="w-4 h-4 text-amber-600 fill-amber-100" />
          <span className="text-xs font-medium text-amber-700 hidden sm:inline">
            Hot
          </span>
        </div>
      )}
    </div>
  );
}
