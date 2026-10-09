"use client";;
import { motion, useReducedMotion } from "motion/react";
import React from "react";

const defaultContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const presetVariants = {
  fade: {},
  slide: {
    hidden: { y: 20 },
    visible: { y: 0 },
  },
  scale: {
    hidden: { scale: 0.8 },
    visible: { scale: 1 },
  },
  blur: {
    hidden: { filter: "blur(4px)" },
    visible: { filter: "blur(0px)" },
  },
  "blur-slide": {
    hidden: { filter: "blur(4px)", y: 20 },
    visible: { filter: "blur(0px)", y: 0 },
  },
  zoom: {
    hidden: { scale: 0.5 },
    visible: {
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  },
  flip: {
    hidden: { rotateX: -90 },
    visible: {
      rotateX: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  },
  bounce: {
    hidden: { y: -50 },
    visible: {
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  },
  rotate: {
    hidden: { rotate: -180 },
    visible: {
      rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 15 },
    },
  },
  swing: {
    hidden: { rotate: -10 },
    visible: {
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 8 },
    },
  },
};

const reducedContainerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0 } },
};

const reducedItemVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const addDefaultVariants = (variants) => ({
  hidden: { ...defaultItemVariants.hidden, ...variants.hidden },
  visible: { ...defaultItemVariants.visible, ...variants.visible },
});

function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  as = "div",
  asChild = "div"
}) {
  const shouldReduceMotion = useReducedMotion();

  const selectedVariants = {
    item: addDefaultVariants(preset ? presetVariants[preset] : {}),
    container: addDefaultVariants(defaultContainerVariants),
  };
  const containerVariants = shouldReduceMotion
    ? reducedContainerVariants
    : (variants?.container ?? selectedVariants.container);
  const itemVariants = shouldReduceMotion
    ? reducedItemVariants
    : (variants?.item ?? selectedVariants.item);

  const MotionComponent = motion(as);

  const MotionChild = motion(asChild);

  return (
    <MotionComponent
      animate="visible"
      className={className}
      initial="hidden"
      variants={containerVariants}>
      {React.Children.map(children, (child, index) => (
        <MotionChild
          // biome-ignore lint/suspicious/noArrayIndexKey: React.Children order is stable
          key={index}
          variants={itemVariants}>
          {child}
        </MotionChild>
      ))}
    </MotionComponent>
  );
}

export { AnimatedGroup };
