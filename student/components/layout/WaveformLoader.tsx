"use client";

import { motion } from "framer-motion";

interface WaveformLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function WaveformLoader({ size = "md", color = "#1c1917" }: WaveformLoaderProps) {
  const barHeights = {
    sm: [8, 12, 16, 12, 8],
    md: [12, 20, 28, 20, 12],
    lg: [16, 28, 40, 28, 16],
  };

  const containerSizes = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${containerSizes[size]}`}>
      {barHeights[size].map((height, index) => (
        <motion.div
          key={index}
          className="rounded-full"
          style={{
            backgroundColor: color,
            height: `${height}px`,
            width: size === "sm" ? "3px" : size === "md" ? "4px" : "6px",
          }}
          animate={{
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
