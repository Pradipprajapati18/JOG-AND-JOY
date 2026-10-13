import React from 'react';
import './CustomIcons.css';

// Reusable SVG Wrapper with Playful Styling and Customizable Attributes
const IconWrapper = ({ 
  children, 
  size = 24, 
  className = '', 
  color = 'currentColor', 
  strokeWidth = 2.5, // Soft 2-2.5px strokes
  animationClass = '',
  viewBox = '0 0 24 24',
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`custom-icon inline-block select-none transition-transform duration-200 ${animationClass} ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
};

// 1. Home - Cute House with rounded edges and soft chimney puff
export const Home = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M9 22V12a3 3 0 0 1 6 0v10" />
    <circle cx="12" cy="7.5" r="1.5" fill="currentColor" opacity="0.15" />
  </IconWrapper>
);

// 2. ShoppingBag (Shop) - Puffy bag with curved handle & smiley face
export const ShoppingBag = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
    <path d="M10 14.5a2 2 0 0 0 4 0" strokeWidth={2} /> {/* Cute smile */}
  </IconWrapper>
);

// 3. Heart (Wishlist) - Puffy, cute heart shape
export const Heart = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />
  </IconWrapper>
);

// 4. Search - Magnifying Glass with soft reflection line
export const Search = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M21 21l-5.2-5.2" />
    <path d="M8 8a3 3 0 0 1 3-3" strokeWidth={1.5} opacity={0.6} /> {/* Reflection */}
  </IconWrapper>
);

// 5. SlidersHorizontal / Filter - Rounded dials/sliders
export const SlidersHorizontal = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <circle cx="4" cy="12" r="2.5" fill="currentColor" opacity="0.1" />
    <circle cx="12" cy="10" r="2.5" fill="currentColor" opacity="0.1" />
    <circle cx="20" cy="14" r="2.5" fill="currentColor" opacity="0.1" />
  </IconWrapper>
);

export const Filter = SlidersHorizontal;

// 6. ArrowRight - Smooth, rounded end arrow
export const ArrowRight = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </IconWrapper>
);

// 7. ArrowLeft - Flipped rounded arrow
export const ArrowLeft = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </IconWrapper>
);

// 8. Trash2 - Bin with small heart emblem
export const Trash2 = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 12v4" />
    <path d="M9 12v4" />
    <path d="M15 12v4" />
  </IconWrapper>
);

// 9. Sparkles - Cute magic stars of different sizes
export const Sparkles = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <path d="M9.96 22a.78.78 0 0 1-.76-.56L7.94 17.5a.78.78 0 0 0-.56-.56L3.44 15.8a.78.78 0 0 1 0-1.5l3.94-1.14c.25-.07.45-.27.56-.56L9.2 8.7a.78.78 0 0 1 1.52 0l1.14 3.94c.07.25.27.45.56.56l3.94 1.14a.78.78 0 0 1 0 1.5l-3.94 1.14a.78.78 0 0 0-.56.56l-1.14 3.94a.78.78 0 0 1-.76.56Z" />
    <path d="M18.5 8.5a.4.4 0 0 1-.38-.28l-.57-2a.4.4 0 0 0-.28-.28l-2-.57a.4.4 0 0 1 0-.76l2-.57a.4.4 0 0 0 .28-.28l.57-2a.4.4 0 0 1 .76 0l.57 2a.4.4 0 0 0 .28.28l2 .57a.4.4 0 0 1 0 .76l-2 .57a.4.4 0 0 0-.28.28l-.57 2a.4.4 0 0 1-.38.28Z" />
  </IconWrapper>
);

// 10. ChevronLeft / ChevronRight / ChevronDown / ChevronUp - Friendly rounded indicators
export const ChevronLeft = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M15 18l-6-6 6-6" />
  </IconWrapper>
);

export const ChevronRight = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M9 18l6-6-6-6" />
  </IconWrapper>
);

export const ChevronDown = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M6 9l6 6 6-6" />
  </IconWrapper>
);

export const ChevronUp = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M18 15l-6-6-6 6" />
  </IconWrapper>
);

// 11. Network - Toy Blocks Connection representation
export const Network = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="9" y="2" width="6" height="6" rx="2" />
    <rect x="2" y="16" width="6" height="6" rx="2" />
    <rect x="16" y="16" width="6" height="6" rx="2" />
    <path d="M12 8v8M5 12h14v4M5 16v-4" />
  </IconWrapper>
);

// 12. Globe - Cute Earth with hearts
export const Globe = (props) => (
  <IconWrapper animationClass="animate-rotate-hover" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    <path d="M2 12h20" />
  </IconWrapper>
);

// 13. MapPin (Address) - Location pin shaped with a small heart hole
export const MapPin = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <path d="M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
  </IconWrapper>
);

// 14. Send - Paper airplane with rounded corners
export const Send = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7Z" />
  </IconWrapper>
);

// 15. CheckCircle2 - Verified badge
export const CheckCircle2 = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
    <path d="M9 12l2 2 4-4" />
  </IconWrapper>
);

// 16. Building - Toy store facade
export const Building = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <rect x="4" y="10" width="16" height="12" rx="2" />
    <path d="M6 10V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
    <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
    <circle cx="12" cy="7" r="1.5" />
  </IconWrapper>
);

// 17. Mail (Contact) - Envelope sealed with a puffy heart
export const Mail = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M21 7.5L12 13 3 7.5" />
    <path d="M12 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#EF4A45" stroke="#EF4A45" /> {/* Heart/Circle seal */}
  </IconWrapper>
);

// 18. Phone - Cute rounded telephone receiver
export const Phone = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </IconWrapper>
);

// 19. User (Profile) - Cute boy face wearing a baseball cap
export const User = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    {/* Shoulders */}
    <path d="M5 21a7 7 0 0 1 14 0" />
    {/* Head/Face */}
    <circle cx="12" cy="11.5" r="4.5" />
    {/* Cap Dome */}
    <path d="M8.5 9a4.5 4.5 0 0 1 7 0" fill="currentColor" opacity="0.15" />
    {/* Cap Brim/Visor */}
    <path d="M10.5 7.5c1.5-0.5 4-0.5 5.5 0.5 1 0.7 0.5 1.5-1 1.5H10.5" />
    {/* Small button on top of cap */}
    <circle cx="12" cy="4.5" r="0.8" fill="currentColor" />
  </IconWrapper>
);

// 20. Minus - Thick horizontal bar
export const Minus = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

// 21. Plus - Thick cross
export const Plus = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

// 22. X - Thick close mark
export const X = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

// 23. Truck (Fast Delivery) - Rocket parcel (parcel flying with exhaust flames!)
export const Truck = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    {/* Delivery box truck styled with rounded wheels and cute cabin */}
    <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8Z" />
    <path d="M14 9h4l4 4v5h-8Z" />
    <circle cx="7.5" cy="18.5" r="2.5" fill="currentColor" />
    <circle cx="17" cy="18.5" r="2.5" fill="currentColor" />
  </IconWrapper>
);

// 24. CreditCard (Checkout) - Card with heart chip
export const CreditCard = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="1" y="4" width="22" height="16" rx="3" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <rect x="4" y="14" width="4" height="2" rx="0.5" fill="currentColor" />
    <circle cx="18" cy="15" r="1.5" fill="#EF4A45" stroke="#EF4A45" /> {/* Heart logo position */}
  </IconWrapper>
);

// 25. Clock - Puffy rounded clock face
export const Clock = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </IconWrapper>
);

// 26. Briefcase (Career) - Satchel bag
export const Briefcase = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </IconWrapper>
);

// 27. Upload - Soft arrow pointing out
export const Upload = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </IconWrapper>
);

// 28. Palette (Art) - Artist palette
export const Palette = (props) => (
  <IconWrapper animationClass="animate-rotate-hover" {...props}>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32454 19.466 5.32454 20.2114 4.86221 20.6789C4.37229 21.1744 3.56846 21.1444 3.12328 20.6128C1.52309 18.6946 0.5 16.1436 0.5 13.375C0.5 6.475 6.025 1 12.875 1C19.725 1 25.25 6.475 25.25 13.375C25.25 20.275 19.725 25.75 12.875 25.75C12 25.75 11.5 25.25 11.5 24.5C11.5 23.95 11.75 23.6 12 23C12.3 22.3 12 22 12 22Z" viewBox="0 0 26 26" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="#EF4A45" stroke="#EF4A45" />
    <circle cx="11.5" cy="7.5" r="1.5" fill="#FFD800" stroke="#FFD800" />
    <circle cx="16.5" cy="9.5" r="1.5" fill="#00A3E0" stroke="#00A3E0" />
  </IconWrapper>
);

// 29. Scissors - Rounded scissor handles
export const Scissors = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="9.8" y1="8.2" x2="20" y2="18.5" />
    <line x1="9.8" y1="15.8" x2="20" y2="5.5" />
  </IconWrapper>
);

// 30. Star - Puffy 5-point star
export const Star = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
  </IconWrapper>
);

// 31. Bot (Live Chat) - Toy robot face
export const Bot = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="3" y="11" width="18" height="10" rx="3" />
    <circle cx="8.5" cy="16" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="16" r="1.5" fill="currentColor" />
    <path d="M12 6V3" />
    <circle cx="12" cy="3" r="1" fill="currentColor" />
    <path d="M10 21c1.333-.5 2.667-.5 4 0" />
  </IconWrapper>
);

// 32. Ruler - Size guide tape measure
export const Ruler = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="2" y="7" width="20" height="10" rx="2" />
    <line x1="6" y1="7" x2="6" y2="11" />
    <line x1="10" y1="7" x2="10" y2="11" />
    <line x1="14" y1="7" x2="14" y2="11" />
    <line x1="18" y1="7" x2="18" y2="11" />
  </IconWrapper>
);

// 33. Package (Orders) - Closed shipping parcel box
export const Package = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M21 7.5L12 3 3 7.5M21 7.5v9L12 21M21 7.5L12 12M3 7.5v9L12 21M3 7.5L12 12" />
    <path d="M12 12v9" />
  </IconWrapper>
);

// 34. LogOut (Logout) - Exit door
export const LogOut = (props) => (
  <IconWrapper animationClass="animate-rotate-hover" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </IconWrapper>
);

// 35. Menu (Hamburger) - Two uneven rounded horizontal lines
export const Menu = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="3" y1="16" x2="15" y2="16" />
  </IconWrapper>
);

// 36. Cloud - Puffy sky cloud
export const Cloud = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" />
    <path d="M5.1 17a5 5 0 0 0 13.9 0" />
  </IconWrapper>
);

// 37. Sun (Summer) - Happy sun with face
export const Sun = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.1" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </IconWrapper>
);

// 38. ExternalLink - Link arrow
export const ExternalLink = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </IconWrapper>
);

// 39. HelpCircle - Question mark
export const HelpCircle = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={3} />
  </IconWrapper>
);

// 40. MessageCircle (Support Chat) - Headset style representation
export const MessageCircle = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  </IconWrapper>
);

export const MessageSquare = MessageCircle;

// 41. ArrowUp - Smooth top scroll indicator
export const ArrowUp = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </IconWrapper>
);

// 42. Flame (Hot/Popular) - Small campfire
export const Flame = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  </IconWrapper>
);

// 43. Tag (Coupon) - Gift ticket tag
export const Tag = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={3.5} />
  </IconWrapper>
);

// 44. Snowflake (Winter) - Wool cap snow
export const Snowflake = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
  </IconWrapper>
);

// 45. PartyPopper - Celebrating cone
export const PartyPopper = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <path d="M5.8 11.3L2 22l10.7-3.8" />
    <path d="M4 14h8v8" opacity={0.15} />
    <circle cx="17" cy="5" r="1.5" fill="currentColor" />
    <circle cx="21" cy="9" r="1.5" fill="currentColor" />
    <circle cx="13" cy="9" r="1.5" fill="currentColor" />
    <path d="M19 14.5c.3-.3.3-.8 0-1.1" />
  </IconWrapper>
);

// 46. Quote - Puffy speech indicators
export const Quote = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M3 21c3 0 7-1 7-8V5H3v8h3c0 3-1 6-3 8Zm11 0c3 0 7-1 7-8V5h-7v8h3c0 3-1 6-3 8Z" fill="currentColor" opacity="0.1" />
  </IconWrapper>
);

// 47. Camera (Instagram) - Cute rounded shooter
export const Camera = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
    <circle cx="18.5" cy="8.5" r="0.8" fill="currentColor" />
  </IconWrapper>
);

// 48. ArrowUpRight - Curved indicators
export const ArrowUpRight = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </IconWrapper>
);

// 49. Eye - Shop Quick Eye
export const Eye = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </IconWrapper>
);

// 50. ShieldCheck / SecurePayment - Shield with heart
export const ShieldCheck = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="M9 12l2 2 4-4" />
  </IconWrapper>
);

// 51. TrendingUp - Smooth up trend
export const TrendingUp = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </IconWrapper>
);

// 52. Grid - CategoriesRounded toy blocks
export const Grid = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </IconWrapper>
);

// 53. Zap (Quick actions) - Playful lightning bolt
export const Zap = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconWrapper>
);

// Decorative Doodles (clouds, stars, rainbows, flowers, smiley, confetti, paw print)
export const CloudIcon = Cloud;
export const StarIcon = Star;
export const HeartIcon = Heart;

export const RainbowIcon = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <path d="M2 20a10 10 0 0 1 20 0" />
    <path d="M6 20a6 6 0 0 1 12 0" />
    <path d="M10 20a2 2 0 0 1 4 0" />
  </IconWrapper>
);

export const FlowerIcon = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    <circle cx="12" cy="7" r="2" />
    <circle cx="12" cy="17" r="2" />
    <circle cx="7" cy="12" r="2" />
    <circle cx="17" cy="12" r="2" />
  </IconWrapper>
);

export const SmileyIcon = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3.5} />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3.5} />
  </IconWrapper>
);

export const ConfettiIcon = PartyPopper;

export const PawIcon = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <circle cx="12" cy="14" r="4.5" fill="currentColor" opacity="0.1" />
    <circle cx="12" cy="13" r="3.5" />
    <circle cx="7.5" cy="8.5" r="2" />
    <circle cx="16.5" cy="8.5" r="2" />
    <circle cx="11" cy="5.5" r="2" />
    <circle cx="13" cy="5.5" r="2" />
  </IconWrapper>
);

// 54. RotateCcw (Easy Returns / Refresh state)
export const RotateCcw = (props) => (
  <IconWrapper animationClass="animate-rotate-hover" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </IconWrapper>
);

// 55. Share2 (Product sharing)
export const Share2 = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </IconWrapper>
);

// 56. Lock (Secure payment / checkout)
export const Lock = (props) => (
  <IconWrapper animationClass="animate-bounce-hover" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconWrapper>
);

// 57. Baby (Newborn categoryonesie)
export const Baby = (props) => (
  <IconWrapper animationClass="animate-wiggle-hover" {...props}>
    <path d="M14 2a2 2 0 0 1 2 2v2l2 2a2 2 0 0 1 .58 1.42v5.16a2 2 0 0 1-1.18 1.82l-3.4 1.7a2 2 0 0 1-1.6 0l-3.4-1.7a2 2 0 0 1-1.18-1.82V9.42A2 2 0 0 1 8 8l2-2V4a2 2 0 0 1 2-2Z" />
    <path d="M10 6h4" />
    <path d="M9 13a3 3 0 0 0 6 0" />
  </IconWrapper>
);

// 58. Compass (Categories exploration)
export const Compass = (props) => (
  <IconWrapper animationClass="animate-rotate-hover" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.1" />
  </IconWrapper>
);

// 59. ThumbsUp (Like)
export const ThumbsUp = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </IconWrapper>
);

// 60. Sparkle (Star details)
export const Sparkle = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <path d="M12 3l1.91 5.82L20 10.73l-5.82 1.91L12 21l-1.91-5.82L4 12.73l5.82-1.91L12 3z" />
  </IconWrapper>
);

// 61. Smile (Satisfaction face)
export const Smile = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} />
  </IconWrapper>
);

// 62. Maximize2 (Expand modal/flex)
export const Maximize2 = (props) => (
  <IconWrapper animationClass="animate-scale-hover" {...props}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </IconWrapper>
);

// 63. RefreshCw (Recycle loop)
export const RefreshCw = (props) => (
  <IconWrapper animationClass="animate-rotate-hover" {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </IconWrapper>
);

// 64. Award (Premium Quality / Brand badge)
export const Award = (props) => (
  <IconWrapper animationClass="animate-sparkle-hover" {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </IconWrapper>
);
