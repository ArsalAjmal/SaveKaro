import React from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

export const BorderBeam = ({
  className,
  size = 80,
  delay = 0,
  duration = 6,
  colorFrom = "#7400ff",
  colorTo = "#9b41ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderThickness = 1,
  opacity = 1,
  glowIntensity = 0,
  beamBorderRadius,
  pauseOnHover = false,
  speedMultiplier = 1,
}) => {
  // Calculate actual duration based on speed multiplier
  const actualDuration = speedMultiplier ? duration / speedMultiplier : duration;
  
  // Generate box shadow for glow effect
  const glowEffect = glowIntensity > 0 
    ? `0 0 ${glowIntensity * 5}px ${glowIntensity * 2}px var(--color-from)` 
    : undefined;

  return (
    <div 
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        border: '1px solid transparent',
        WebkitMaskClip: 'padding-box, border-box',
        maskClip: 'padding-box, border-box',
        WebkitMaskComposite: 'intersect',
        maskComposite: 'intersect',
        WebkitMaskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        maskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: size,
          aspectRatio: '1',
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${beamBorderRadius ?? size}px)`,
          opacity: opacity,
          boxShadow: glowEffect,
          borderRadius: beamBorderRadius ? `${beamBorderRadius}px` : undefined,
          ...style,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: actualDuration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};
