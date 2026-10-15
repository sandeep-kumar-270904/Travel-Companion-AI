import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function SmoothCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  // Spring physics for the crisp cursor ring (snappy, zero perceived latency)
  const ringX = useSpring(mouseX, { damping: 26, stiffness: 320, mass: 0.2 });
  const ringY = useSpring(mouseY, { damping: 26, stiffness: 320, mass: 0.2 });

  // Spring physics for the ambient fluid glow (smooth, relaxed follow-through)
  const auraX = useSpring(mouseX, { damping: 35, stiffness: 140, mass: 0.5 });
  const auraY = useSpring(mouseY, { damping: 35, stiffness: 140, mass: 0.5 });

  useEffect(() => {
    // Check if the user has a mouse/trackpad (not a purely touch device)
    const media = window.matchMedia('(pointer: fine)');
    setIsFinePointer(media.matches);

    const handleMediaChange = (e) => setIsFinePointer(e.matches);
    media.addEventListener('change', handleMediaChange);

    if (!media.matches) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if current target or ancestor is interactive
      const target = e.target;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.cursor-pointer') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      media.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isFinePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* 1. Ambient Fluid Glow Spotlight */}
      <motion.div
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? (isHovered ? 0.35 : 0.22) : 0,
          scale: isHovered ? 1.25 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="fixed w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(0,243,255,0.2)_0%,rgba(181,53,246,0.12)_35%,rgba(0,0,0,0)_70%)] blur-2xl will-change-transform"
      />

      {/* 2. Delicate Interactive Cursor Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovered ? 1.6 : 1,
          borderColor: isHovered ? 'rgba(0, 243, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
          backgroundColor: isHovered ? 'rgba(0, 243, 255, 0.08)' : 'transparent',
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed w-7 h-7 rounded-full border border-white/30 backdrop-blur-[1px] shadow-[0_0_12px_rgba(0,243,255,0.25)] flex items-center justify-center will-change-transform"
      >
        {/* Center micro dot */}
        <motion.div
          animate={{
            scale: isHovered ? 0 : 1,
            opacity: isHovered ? 0 : 1,
          }}
          transition={{ duration: 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_#00f3ff]"
        />
      </motion.div>
    </div>
  );
}
