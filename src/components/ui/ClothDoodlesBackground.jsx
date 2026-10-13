import React from 'react';
import { motion } from 'framer-motion';

const doodles = [
  // 1. T-Shirt Doodle (Top Left)
  {
    top: '4%',
    left: '3%',
    color: '#FF7A59',
    size: 'w-10 h-10',
    duration: 5,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L2 6v4l4-2v14h12V8l4 2V6l-4-4-4 2-4-2z" />
      </svg>
    )
  },
  // 2. Swinging Hanger (Top Right)
  {
    top: '6%',
    right: '4%',
    color: '#AEE6FF',
    size: 'w-12 h-12',
    duration: 6,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L2 14h20L14.2 7A3 3 0 0 0 12 2z" />
        <path d="M2 14v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
      </svg>
    )
  },
  // 3. Floating Paper Plane (Upper Mid Left)
  {
    top: '14%',
    left: '5%',
    color: '#8DD67C',
    size: 'w-10 h-10',
    duration: 7,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    )
  },
  // 4. Bouncing Teddy Bear (Upper Mid Right)
  {
    top: '18%',
    right: '5%',
    color: '#FFD5A1',
    size: 'w-11 h-11',
    duration: 4.5,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="14" r="6" />
        <circle cx="12" cy="7" r="4" />
        <circle cx="7" cy="4" r="2" />
        <circle cx="17" cy="4" r="2" />
        <circle cx="10" cy="6" r="0.5" fill="currentColor" />
        <circle cx="14" cy="6" r="0.5" fill="currentColor" />
      </svg>
    )
  },
  // 5. Pastel Rainbow (Mid Left)
  {
    top: '28%',
    left: '3%',
    color: '#FF7A59',
    size: 'w-12 h-12',
    duration: 6.5,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 17a10 10 0 0 0-20 0" />
        <path d="M19 17a7 7 0 0 0-14 0" />
        <path d="M16 17a4 4 0 0 0-8 0" />
      </svg>
    )
  },
  // 6. Blinking Smiley Face (Mid Right)
  {
    top: '34%',
    right: '4%',
    color: '#FFD5A1',
    size: 'w-10 h-10',
    duration: 5,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    )
  },
  // 7. Rotating Building Block (Lower Mid Left)
  {
    top: '48%',
    left: '4%',
    color: '#AEE6FF',
    size: 'w-11 h-11',
    duration: 8,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <path d="M8 8h8v8H8z" />
      </svg>
    )
  },
  // 8. Floating Balloon (Lower Mid Right)
  {
    top: '52%',
    right: '5%',
    color: '#FF7A59',
    size: 'w-11 h-11',
    duration: 5.5,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7z" />
        <path d="M12 20v4" />
      </svg>
    )
  },
  // 9. Cute Sock (Bottom Left)
  {
    top: '68%',
    left: '3%',
    color: '#8DD67C',
    size: 'w-10 h-10',
    duration: 6.2,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2h8v8l3 4v4a3 3 0 0 1-3 3h-2a6 6 0 0 1-6-6V2z" />
      </svg>
    )
  },
  // 10. Tiny Flower & Sparkle (Bottom Right)
  {
    top: '74%',
    right: '4%',
    color: '#FFD5A1',
    size: 'w-10 h-10',
    duration: 5.8,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
      </svg>
    )
  },
  // 11. ABC Letter Block (Far Bottom Left)
  {
    top: '86%',
    left: '4%',
    color: '#AEE6FF',
    size: 'w-10 h-10',
    duration: 7.2,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 17l3-8 3 8" />
        <path d="M10 14h4" />
      </svg>
    )
  },
  // 12. Toy Car (Far Bottom Right)
  {
    top: '90%',
    right: '5%',
    color: '#8DD67C',
    size: 'w-12 h-12',
    duration: 6.6,
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17h14M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M5 13l2-6h10l2 6v4H5v-4z" />
      </svg>
    )
  }
];

export default function ClothDoodlesBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {doodles.map((d, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            right: d.right,
            color: d.color,
            opacity: 0.2
          }}
          className={`${d.size} select-none hidden md:block`}
          animate={{
            y: [0, -14, 0],
            rotate: [-5, 5, -5],
            scale: [0.96, 1.04, 0.96]
          }}
          transition={{
            duration: d.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        >
          {d.svg}
        </motion.div>
      ))}
    </div>
  );
}
