'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WaveformLoaderProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WaveformLoader({ 
  color = '#8b5cf6', 
  size = 'md' 
}: WaveformLoaderProps) {
  const sizeMap = {
    sm: { width: 40, height: 30, barWidth: 3 },
    md: { width: 80, height: 50, barWidth: 5 },
    lg: { width: 120, height: 70, barWidth: 7 },
  };

  const { width, height, barWidth } = sizeMap[size];
  const numBars = 7;

  // Generate staggered animation delays
  const getDelay = (index: number) => `${index * 0.1}s`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="waveform-loader"
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {[...Array(numBars)].map((_, i) => {
        const barHeight = height * (0.3 + Math.random() * 0.6);
        const x = i * (barWidth + 4);
        const y = (height - barHeight) / 2;

        return (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={barWidth / 2}
            fill={`url(#gradient-${color})`}
            animate={{
              scaleY: [0.3, 1, 0.3],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: getDelay(i),
              ease: [0.4, 0, 0.6, 1], // Custom cubic bezier for smooth waveform
            }}
            style={{
              transformOrigin: 'center',
            }}
          />
        );
      })}
    </svg>
  );
}
