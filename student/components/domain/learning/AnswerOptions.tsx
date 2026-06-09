import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * AnswerOptions Component
 * 
 * Purpose: Present answer choices for questions (MCQ format)
 * Mobile Behavior: Large touch targets for selection (44px min)
 * Accessibility: Radio/checkbox patterns, feedback announcements
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of option strings
 * @param {string | number} props.selectedOption - Currently selected option index
 * @param {Function} props.onSelect - Selection handler
 * @param {'practice' | 'review'} props.mode - Display mode
 * @param {string} props.correctOption - Correct answer (review mode)
 */
interface AnswerOptionsProps {
  options: string[];
  selectedOption?: string | number;
  onSelect?: (optionIndex: number) => void;
  mode: 'practice' | 'review';
  correctOption?: string;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  selectedOption,
  onSelect,
  mode,
  correctOption
}) => {
  return (
    <div 
      className="space-y-2" 
      role="radiogroup" 
      aria-label="Answer options"
    >
      {options.map((option, index) => {
        const isSelected = selectedOption === index || selectedOption === option;
        const isCorrect = correctOption === option;
        const isIncorrect = isSelected && !isCorrect;
        const showResult = mode === 'review';

        let borderColor = 'var(--color-border)';
        let backgroundColor = 'transparent';
        let icon = null;

        if (showResult) {
          if (isCorrect) {
            borderColor = 'var(--color-success)';
            backgroundColor = 'rgba(22, 163, 74, 0.1)';
            icon = (
              <Check
                size={20}
                stroke="var(--color-success)"
                strokeWidth={2}
                aria-hidden="true"
              />
            );
          } else if (isIncorrect) {
            borderColor = 'var(--color-error)';
            backgroundColor = 'rgba(239, 68, 68, 0.1)';
            icon = (
              <X
                size={20}
                stroke="var(--color-error)"
                strokeWidth={2}
                aria-hidden="true"
              />
            );
          }
        } else if (isSelected) {
          borderColor = 'var(--color-primary)';
          backgroundColor = 'rgba(59, 130, 246, 0.1)';
        }

        return (
          <button
            key={index}
            onClick={() => mode === 'practice' && onSelect?.(index)}
            disabled={mode === 'review'}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-lg border transition-all"
            style={{
              borderColor,
              backgroundColor,
              minHeight: '44px', // Touch target minimum
            }}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={mode === 'review'}
            aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
          >
            {/* Option Label */}
            <div className="flex items-center gap-3 flex-1">
              <span
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-tertiary)',
                  color: isSelected
                    ? 'var(--color-text-inverse)'
                    : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span
                className="text-base text-text-primary text-left"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {option}
              </span>
            </div>

            {/* Status Icon */}
            {icon && (
              <div className="flex-shrink-0" aria-hidden="true">
                {icon}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AnswerOptions;
