import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CartoonBear = ({ isHovering, isClicking }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
    {/* Ears */}
    <circle cx="20" cy="25" r="16" fill="#A0522D" />
    <circle cx="20" cy="25" r="8" fill="#F4A460" />
    <circle cx="80" cy="25" r="16" fill="#A0522D" />
    <circle cx="80" cy="25" r="8" fill="#F4A460" />

    {/* Head */}
    <circle cx="50" cy="55" r="42" fill="#CD853F" />

    {/* Snout */}
    <ellipse cx="50" cy="65" rx="22" ry="16" fill="#FFF8EC" />
    
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="8" ry="5" fill="#1E1E1E" />

    {/* Eyes */}
    {isClicking ? (
      <>
        <path d="M 30 42 L 40 48 L 30 54" fill="none" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 70 42 L 60 48 L 70 54" fill="none" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : isHovering ? (
      <>
        <path d="M 30 45 Q 35 35 40 45" fill="none" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" />
        <path d="M 60 45 Q 65 35 70 45" fill="none" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="34" cy="43" r="6" fill="#1E1E1E" />
        <circle cx="36" cy="41" r="2" fill="#FFFFFF" />
        <circle cx="66" cy="43" r="6" fill="#1E1E1E" />
        <circle cx="68" cy="41" r="2" fill="#FFFFFF" />
      </>
    )}

    {/* Mouth */}
    {isHovering ? (
      <path d="M 42 65 Q 50 85 58 65 Z" fill="#EF4A45" />
    ) : (
      <path d="M 42 66 Q 50 72 58 66" fill="none" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" />
    )}
  </svg>
);

export default function CartoonCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isVisible]);

  if (isTouchDevice) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main animated Cartoon Face */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1,
              scale: isClicking ? 0.9 : isHovering ? 1.3 : 1,
              x: mousePosition.x + 16, 
              y: mousePosition.y + 16,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 150, damping: 15, mass: 0.6 },
              y: { type: 'spring', stiffness: 150, damping: 15, mass: 0.6 },
              scale: { type: 'spring', stiffness: 400, damping: 15 },
              opacity: { duration: 0.2 }
            }}
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-9999 flex items-center justify-center"
            style={{ willChange: 'transform' }}
          >
            <motion.div
              animate={{ 
                rotate: isClicking ? -15 : isHovering ? 15 : 0,
                y: isHovering ? -5 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-full h-full"
            >
              <CartoonBear isHovering={isHovering} isClicking={isClicking} />
            </motion.div>
          </motion.div>

          {/* Smaller trailing bubble (like a cartoon tail or dust) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isHovering ? 0 : 1,
              x: mousePosition.x + 36, 
              y: mousePosition.y + 48,
              scale: isClicking ? 0 : 1
            }}
            exit={{ opacity: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 100, damping: 20, mass: 1 },
              y: { type: 'spring', stiffness: 100, damping: 20, mass: 1 },
            }}
            className="fixed top-0 left-0 w-3 h-3 pointer-events-none z-9998 rounded-full bg-white border-2 border-[#1E1E1E]"
            style={{ willChange: 'transform' }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
