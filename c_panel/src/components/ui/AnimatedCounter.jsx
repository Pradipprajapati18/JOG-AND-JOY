import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 2, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const displayValue = useTransform(springValue, (current) => Math.round(current) + suffix);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
}
