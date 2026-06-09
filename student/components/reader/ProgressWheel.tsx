'use client';

import { Star } from 'lucide-react';

export default function ProgressWheel({ progress = 0, size = 120, strokeWidth = 8 }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Determine color and status based on progress
  let color = 'text-slate-300';
  let statusText = 'Not started';
  let showStar = false;

  if (progress >= 80) {
    color = 'text-emerald-500';
    statusText = 'Mastered!';
    showStar = true;
  } else if (progress >= 30) {
    color = 'text-yellow-500';
    statusText = `${Math.round(progress)}% Complete`;
  } else if (progress > 0) {
    color = 'text-yellow-400';
    statusText = 'In Progress';
  }

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-200"
        />
        
        {/* Progress circle with animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showStar && (
          <Star className="w-8 h-8 text-emerald-500 fill-emerald-500 animate-bounce" />
        )}
        <span className={`text-lg font-bold ${progress === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Status label below */}
      <span className={`mt-2 text-xs font-medium ${
        progress >= 80 ? 'text-emerald-600' : 
        progress >= 30 ? 'text-yellow-600' : 
        'text-slate-500'
      }`}>
        {statusText}
      </span>
    </div>
  );
}
