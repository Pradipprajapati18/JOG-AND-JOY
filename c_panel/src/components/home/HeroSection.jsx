"use client";

import React, { useMemo } from 'react';
import ImageTrail from './ImageTrail';
import heroBgDesktop from "../../assets/hero-bg-desktop.webp";
import heroBgMobile from "../../assets/hero-bg-mobile.webp";
import tshirt from "../../assets/cutout-tshirt.webp";
import shorts from "../../assets/cutout-shorts.webp";
import sun from "../../assets/cutout-sun.webp";
import cloud from "../../assets/cutout-cloud.webp";
import star from "../../assets/cutout-star.webp";

const cutouts = [
  { src: sun, className: "top-[6%] left-[4%] w-16 sm:w-20 md:w-36 z-2", rotDeg: -10, fromX: "-80px", fromY: "-60px", delay: "0s", label: "Smiling sun" },
  { src: cloud, className: "top-[10%] right-[6%] w-16 sm:w-24 md:w-44 z-2", rotDeg: 8, fromX: "90px", fromY: "-70px", delay: "0.15s", label: "Happy cloud" },
  { src: tshirt, className: "bottom-[14%] sm:bottom-[10%] left-[4%] sm:left-[6%] w-20 sm:w-24 md:w-40 z-2", rotDeg: -14, fromX: "-90px", fromY: "90px", delay: "0.30s", label: "Striped t-shirt" },
  { src: shorts, className: "bottom-[14%] sm:bottom-[10%] right-[4%] sm:right-[6%] w-20 sm:w-24 md:w-40 z-2", rotDeg: 12, fromX: "90px", fromY: "90px", delay: "0.45s", label: "Yellow shorts" },
  { src: star, className: "top-[38%] sm:top-[44%] right-[4%] w-12 sm:w-14 md:w-24 z-2", rotDeg: 18, fromX: "100px", fromY: "0px", delay: "0.60s", label: "Cheerful star" },
];

const galleryImages = [
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50.webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (1).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (2).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (3).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (4).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.50 (5).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51.webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (1).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (2).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (3).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (4).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (5).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (6).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (7).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (8).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (9).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (10).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (11).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (12).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (13).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (14).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (15).webp",
  "/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (16).webp"
];

export default function HeroSection() {
  const randomizedTrailImages = useMemo(() => {
    return [...galleryImages].sort(() => 0.5 - Math.random());
  }, []);

  return (
    <section className="relative w-full text-slate-900 flex flex-col md:block items-center justify-center cursor-crosshair h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-white overflow-hidden">
      {/* Preload critical background images */}
      <link rel="preload" as="image" href={heroBgDesktop} fetchPriority="high" media="(min-width: 768px)" />
      <link rel="preload" as="image" href={heroBgMobile} fetchPriority="high" media="(max-width: 767px)" />

      {/* Desktop Background */}
      <div className="absolute inset-0 max-md:hidden z-0" style={{
        backgroundImage: `url(${heroBgDesktop})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }} />

      {/* Mobile Background */}
      <div className="absolute inset-0 md:hidden z-0" style={{
        backgroundImage: `url(${heroBgMobile})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }} />
      
      {/* Background Subtle Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.05,
        backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none"
      }} />

      {/* Image Trail interactive overlay (Desktop mouse trail & Mobile floating cards) */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "auto"
      }}>
        <ImageTrail items={randomizedTrailImages} variant={1} />
      </div>

      {/* Floating Animated Cutouts */}
      {cutouts.map((c, i) => (
        <div
          key={i}
          className={`absolute ${c.className} group cursor-pointer transition-transform duration-200 ease-out hover:scale-110 hover:-translate-y-1 focus-visible:scale-110 focus-visible:-translate-y-1 focus-visible:outline-none`}
          tabIndex={0}
          role="img"
          aria-label={c.label}
        >
          <img
            src={c.src}
            alt=""
            className="animate-cutout-shake drop-shadow-xl group-hover:drop-shadow-2xl transition-[filter] duration-200 pointer-events-none select-none w-full h-full"
            style={
              {
                "--rot-deg": c.rotDeg,
                "--from-x": c.fromX,
                "--from-y": c.fromY,
                animationDelay: c.delay,
                transformOrigin: "center",
              }
            }
          />
        </div>
      ))}
      
      {/* Interactive mouse trail hint in corner */}
      <div className="max-md:hidden" style={{
        position: "absolute",
        bottom: "30px",
        right: "30px",
        fontSize: "0.85rem",
        fontWeight: 500,
        color: "#475569",
        pointerEvents: "none",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <span style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
          display: "inline-block"
        }} />
        Move mouse to reveal trail
      </div>

      {/* Main Tagline Layout Container */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center w-full h-full px-4 py-12 md:px-8 md:py-12 pointer-events-auto md:pointer-events-none">

        {/* Right Side decorative crayon/sketch sticker */}
        <div className="absolute right-4 top-8 w-10 h-10 md:right-8 md:top-12 md:w-12 md:h-12 bg-[#FAF6F0] border-2 border-[#ED6B21] rounded-xl flex items-center justify-center text-lg transform rotate-12 shadow-sm opacity-95 max-md:hidden">
          🖍️
        </div>

        {/* Playful Headline Layout */}
        <h1 className="font-heading-primary text-[clamp(1.2rem,4.5vw,4rem)] md:text-[clamp(2.5rem,4vw,3.5rem)] font-black text-white leading-[1.1] md:leading-tight mb-2 md:mb-6 w-full text-center tracking-tight drop-shadow-lg">
          {/* Dress - custom styled script style with overlaid blue lines */}
          <span className="relative inline-block text-(--color-accent) font-heading-secondary font-normal mr-2 md:mr-3 drop-shadow-md">
            Dress
          </span>
          Your Little Ones in
          
          {/* Emoji Badge inline */}
          <span className="inline-flex items-center justify-center bg-[#ED6B21] rounded-full w-8 h-8 md:w-10 md:h-10 mx-2 text-base md:text-xl align-middle shadow-md shadow-orange-500/40">
            🤠
          </span>
          <br className="hidden md:block" />

          {/* Yellow Card Highlight for 'Colorful' */}
          <span className="inline-block bg-(--color-yellow) text-(--color-accent) px-3 py-1 md:px-5 md:py-1 rounded-xl md:rounded-2xl mr-2 md:mr-3 -rotate-2 shadow-[0_3px_0_#222] border-[1.5px] border-[#222]">
            Colorful
          </span>

          {/* Underlined 'Confidence!' word */}
          <span className="relative inline-block">
            Confidence!
            {/* Draw a thick yellow underline */}
            <span className="absolute left-0 -bottom-1 md:-bottom-2 w-full h-1.5 md:h-2 bg-(--color-yellow) rounded-md border-b-[1.5px] border-[#222]" />
          </span>
        </h1>

        {/* Bottom Content Wrapper */}
        <div className="flex flex-col items-center w-full mt-6 md:mt-0">

        {/* CTAs Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-10 w-full pointer-events-auto">

          <div className="flex items-center gap-4">
            {/* Shop Now Action Button */}
            <a href="/products" className="bg-(--color-accent) text-white px-4 py-2 md:px-8 md:py-3.5 rounded-full text-sm md:text-lg font-black border-[1.5px] border-[#222] shadow-[0_4px_0_#222] transition-transform active:translate-y-1 active:shadow-[0_2px_0_#222] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#222]">
              Shop Now &rarr;
            </a>

            {/* Play Video Action Circle */}
            <a 
              href="/why-us"
              aria-label="Play video review"
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-(--color-green) border-[1.5px] border-[#222] shadow-[0_3px_0_#222] flex items-center justify-center text-white text-base md:text-xl transition-transform hover:scale-110 active:scale-95"
            >
              ▶️
            </a>
          </div>
        </div>
      </div>
    </div>

    </section>
  );
}
