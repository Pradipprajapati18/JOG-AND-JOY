import React, { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { getImageUrl } from '../../utils/getImageUrl';

export default function BrandLogo({ className = 'h-10', showTagline = true, _animate = false, linkTo = '/' }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  // Toy blocks configuration
  const blocksData = useMemo(() => [
    // Base blocks (bottom row)
    { id: 'b1', x: 8, y: 0, w: 14, h: 8, color: '#EF4A45', startX: -60, startY: 10, studs: 2 },
    { id: 'b2', x: 20, y: 0, w: 16, h: 8, color: '#00A3E0', startX: 40, startY: 50, studs: 2 },
    { id: 'b3', x: 33, y: 0, w: 14, h: 8, color: '#4CAF50', startX: 150, startY: -20, studs: 2 },
    { id: 'b4', x: 47, y: 0, w: 16, h: 8, color: '#FF8F00', startX: -30, startY: 40, studs: 2 },
    { id: 'b5', x: 61, y: 0, w: 14, h: 8, color: '#FFD800', startX: 20, startY: 60, studs: 2 },
    { id: 'b6', x: 74, y: 0, w: 16, h: 8, color: '#00A3E0', startX: 180, startY: 10, studs: 2 },
    { id: 'b7', x: 87, y: 0, w: 14, h: 8, color: '#EF4A45', startX: -40, startY: -30, studs: 2 },
    { id: 'b8', x: 96, y: 0, w: 10, h: 8, color: '#FF8F00', startX: 120, startY: 50, studs: 1 },

    // Stacking blocks (second row)
    { id: 's1', x: 20, y: -8, w: 12, h: 8, color: '#FFD800', startX: -50, startY: -30, studs: 2, delay: 0.8 },
    { id: 's2', x: 47, y: -8, w: 12, h: 8, color: '#EF4A45', startX: 160, startY: 20, studs: 2, delay: 0.9 },
    { id: 's3', x: 74, y: -8, w: 12, h: 8, color: '#4CAF50', startX: 74, startY: -60, studs: 2, delay: 1.0 },
    { id: 's4', x: 96, y: -8, w: 8, h: 8, color: '#FF8F00', startX: 150, startY: 40, studs: 1, delay: 1.1 },

    // Tiny base-decoration blocks (construction effect)
    { id: 't1', x: 8, y: -8, w: 8, h: 6, color: '#FF8F00', startX: -20, startY: -80, studs: 1, delay: 1.4 },
    { id: 't2', x: 33, y: -8, w: 10, h: 6, color: '#00A3E0', startX: 33, startY: 60, studs: 1, delay: 1.5 },
    { id: 't3', x: 61, y: -8, w: 8, h: 6, color: '#EF4A45', startX: 61, startY: -70, studs: 1, delay: 1.6 },
    { id: 't4', x: 87, y: -8, w: 10, h: 6, color: '#FFD800', startX: 130, startY: 30, studs: 1, delay: 1.7 }
  ], []);

  // Confetti particles configuration
  const confettiData = useMemo(() => {
    const colorsList = ['#EF4A45', '#00A3E0', '#FFD800', '#4CAF50', '#FF8F00'];
    return Array.from({ length: 28 }).map((_, i) => {
      const colIndex = i % 8;
      const colX = [8, 20, 33, 47, 61, 74, 87, 96][colIndex];
      return {
        id: `c${i}`,
        x: colX + (Math.random() * 8 - 4),
        y: i >= 14 ? -8 : 0,
        size: Math.random() * 3.5 + 2.5, // 2.5px to 6px
        color: colorsList[Math.floor(Math.random() * colorsList.length)],
        shape: Math.random() > 0.55 ? 'circle' : 'square',
        driftX: Math.random() * 36 - 18,
        driftY: -(Math.random() * 50 + 40),
        rotate: Math.random() * 360,
        delay: Math.random() * 0.25
      };
    });
  }, []);

  // Sparkling stars configuration
  const starsData = useMemo(() => [
    { id: 'st1', x: 10, y: 15, scale: 0.8, delay: 0 },
    { id: 'st2', x: 26, y: -8, scale: 0.65, delay: 0.25 },
    { id: 'st3', x: 45, y: 20, scale: 0.9, delay: 0.1 },
    { id: 'st4', x: 64, y: -12, scale: 0.7, delay: 0.35 },
    { id: 'st5', x: 80, y: 15, scale: 0.85, delay: 0.15 },
    { id: 'st6', x: 93, y: -5, scale: 0.6, delay: 0.45 },
    { id: 'st7', x: 4, y: 35, scale: 0.75, delay: 0.5 },
    { id: 'st8', x: 50, y: 38, scale: 0.8, delay: 0.2 }
  ], []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      timelineRef.current = tl;

      // 1. Initial State resets
      gsap.set('.toy-block', { opacity: 0, scale: 1, x: (i) => blocksData[i].startX, y: (i) => blocksData[i].startY });
      gsap.set('.confetti-particle', { opacity: 0, scale: 0, x: 0, y: 0 });
      gsap.set('.sparkle-star', { opacity: 0, scale: 0, y: 0 });

      // 2. Base blocks and stack blocks slide in (0s to 1.2s)
      blocksData.forEach((block) => {
        const entryDelay = block.delay || (Math.random() * 0.25);
        tl.to(`#${block.id}`, {
          x: 0,
          y: block.y,
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out'
        }, entryDelay);
      });

      // 3. Soft snapping and bounce physics (1.2s to 1.7s)
      tl.to('.toy-block', {
        scaleY: 0.78,
        scaleX: 1.12,
        duration: 0.1,
        ease: 'power1.inOut',
      }, 1.2);

      tl.to('.toy-block', {
        scaleY: 1.15,
        scaleX: 0.9,
        y: (i, target) => {
          const yVal = parseFloat(target.getAttribute('data-y') || '0');
          return yVal - 5;
        },
        duration: 0.18,
        ease: 'power2.out',
      }, 1.3);

      tl.to('.toy-block', {
        scaleY: 0.9,
        scaleX: 1.05,
        y: (i, target) => parseFloat(target.getAttribute('data-y') || '0'),
        duration: 0.14,
        ease: 'power2.in',
      }, 1.48);

      tl.to('.toy-block', {
        scaleY: 1,
        scaleX: 1,
        duration: 0.12,
        ease: 'power1.inOut',
      }, 1.62);

      // 4. Transform blocks into confetti and float upward (3.0s to 4.2s)
      tl.to('.toy-block', {
        opacity: 0,
        scale: 0.2,
        duration: 0.28,
        ease: 'power2.in'
      }, 3.0);

      confettiData.forEach((c) => {
        tl.fromTo(`#${c.id}`,
          { x: 0, y: c.y, scale: 0, opacity: 0, rotate: 0 },
          {
            x: c.driftX,
            y: c.y + c.driftY,
            scale: 1,
            opacity: 1,
            rotate: c.rotate,
            duration: 1.1,
            ease: 'power2.out'
          },
          3.0 + c.delay
        );

        tl.to(`#${c.id}`, {
          opacity: 0,
          y: c.y + c.driftY - 25,
          scale: 0.4,
          duration: 0.35,
          ease: 'power1.in'
        }, 3.75 + c.delay);
      });

      // 5. Sparkling stars appear and float upward (3.2s to 4.8s)
      starsData.forEach((s) => {
        tl.fromTo(`#${s.id}`,
          { scale: 0, opacity: 0, rotate: 0, y: 0 },
          {
            scale: s.scale,
            opacity: 1,
            rotate: 135,
            y: -25,
            duration: 1.3,
            ease: 'power1.out'
          },
          3.25 + s.delay
        );

        tl.to(`#${s.id}`, {
          scale: 0,
          opacity: 0,
          y: -40,
          duration: 0.45,
          ease: 'power1.in'
        }, 4.25 + s.delay);
      });

      // 6. Loop buffer - original logo displays cleanly (5.0s to 7.0s)
      tl.to({}, { duration: 2.0 }, 5.0);

    }, containerRef);

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      ctx.revert();
    };
  }, [blocksData, confettiData, starsData]);

  return (
    <Link 
      to={linkTo} 
      className="flex flex-col items-start group select-none"
    >
      <div ref={containerRef} className="relative inline-block overflow-visible select-none">
        {/* The logo image - 100% static, no movement, scaling, rotation or distortion */}
        <img
          src={getImageUrl('official_logo.webp')}
          alt="JOG&JOY® - Love is in the wear"
          className={`${className} w-auto object-contain relative z-20`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        
        {/* Fallback Text in case logo image fails to load */}
        <div className="hidden font-black text-xl text-[#2D2D2D] relative z-20">
          JOG<span className="text-[#00A3E0]">&</span>JOY<sup className="text-xs text-[#EF4A45]">®</sup>
          {showTagline && <span className="block text-[10px] text-[#9DA3A8] font-bold">Love is in the wear</span>}
        </div>

        {/* Lightweight UI Micro-Animation Overlay Layer */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
          {/* Toy Blocks */}
          {blocksData.map((block) => (
            <div
              key={block.id}
              id={block.id}
              className="toy-block absolute"
              data-y={block.y}
              style={{
                left: `${block.x}%`,
                bottom: '-4px', // baseline at the bottom of the logo
                width: `${block.w}px`,
                height: `${block.h}px`,
                backgroundColor: block.color,
                transform: 'translateX(-50%)',
                borderRadius: '1.5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.3)',
                border: '0.5px solid rgba(0,0,0,0.06)'
              }}
            >
              {/* Studs */}
              {block.studs === 2 ? (
                <div className="absolute top-[-1.5px] left-0 right-0 flex justify-around px-0.5 pointer-events-none">
                  <div className="w-[3px] h-[1.5px] rounded-t-[0.5px] bg-inherit brightness-90" />
                  <div className="w-[3px] h-[1.5px] rounded-t-[0.5px] bg-inherit brightness-90" />
                </div>
              ) : (
                <div className="absolute top-[-1.5px] left-0 right-0 flex justify-center pointer-events-none">
                  <div className="w-1 h-[1.5px] rounded-t-[0.5px] bg-inherit brightness-90" />
                </div>
              )}
            </div>
          ))}

          {/* Confetti Particles */}
          {confettiData.map((c) => (
            <div
              key={c.id}
              id={c.id}
              className="confetti-particle absolute"
              style={{
                left: `${c.x}%`,
                bottom: `${-c.y - 4}px`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                borderRadius: c.shape === 'circle' ? '50%' : '1px',
                transform: 'translateX(-50%)',
                boxShadow: '0 0.5px 1px rgba(0,0,0,0.08)'
              }}
            />
          ))}

          {/* Sparkling Stars */}
          {starsData.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="sparkle-star absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: '10px',
                height: '10px',
                color: '#FFD800',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_1px_1.5px_rgba(255,216,0,0.45)]">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="currentColor"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

