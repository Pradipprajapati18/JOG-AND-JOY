"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

const categories = [
  { label: 'KIDS T-SHIRTS', href: '/products?category=Kids&item=Kids+T-Shirt', image: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=300&q=80' },
  { label: 'KIDS JOGGERS & TRACK PANTS', href: '/products?category=Kids&item=Kids+Joggers+%26+Tracks', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80' },
  { label: 'KIDS SHORTS & BERMUDAS', href: '/products?category=Kids&item=Kids+Shorts+%26+Bermudas', image: 'https://images.unsplash.com/photo-1622290319146-7b63df48a635?auto=format&fit=crop&w=300&q=80' },
  { label: 'KIDS NIGHT & PAJAMA SUITS', href: '/products?category=Kids&item=Kids+Night+Suits', image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=300&q=80' },
  { label: 'GIRLS\' FROCKS', href: '/products?category=Female&item=Girl+Frocks', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=300&q=80' },
  { label: 'MEN\'S COLLECTION', href: '/products?category=Male', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=300&q=80', color: '#FEF08A', textColor: '#222222' }
];

const categorySection = {
  heading: "Shop by Department"
};

// Direct color mapping inspired by the brand logo letters
const brandColors = [
  "var(--color-blue)",
  "var(--color-yellow)",
  "var(--color-accent)",
  "var(--color-green)",
  "var(--color-orange)",
  "var(--color-surface)"
];

export default function CategoryGrid() {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef(null);
  const folderRef = useRef(null);
  const cardsParentRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Trigger open when entering view, and close when exiting view to support replay on scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOpen(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "-10% 0px -10% 0px" // Trigger slightly before it fully leaves/enters
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!folderRef.current || !cardsParentRef.current) return;

    const ctx = gsap.context(() => {
      const folderEl = folderRef.current;
      const cards = cardsRef.current.filter((c) => c !== null);

      if (!folderEl || cards.length === 0) return;

      const folderRect = folderEl.getBoundingClientRect();

      // Helper to calculate offset vector from each card to the folder center
      const getOffsets = () => {
        return cards.map((card) => {
          const cardRect = card.getBoundingClientRect();
          const dx = (folderRect.left + folderRect.width / 2) - (cardRect.left + cardRect.width / 2);
          const dy = (folderRect.top + folderRect.height / 2) - (cardRect.top + cardRect.height / 2);
          return { dx, dy };
        });
      };

      if (isOpen) {
        // --- OPEN ANIMATION ---
        const offsets = getOffsets();

        // 1. Position cards inside folder initially
        cards.forEach((card, idx) => {
          const { dx, dy } = offsets[idx];
          gsap.set(card, {
            x: dx,
            y: dy,
            scale: 0.1,
            opacity: 0,
            rotation: gsap.utils.random(-15, 15)
          });
        });

        const tl = gsap.timeline();

        // 2. Open folder front cover
        tl.to(".folder-front-flap", {
          rotateX: -32,
          translateY: 8,
          duration: 0.5,
          ease: "power2.out"
        });

        // 3. Stagger pop out cards to grid alignment
        tl.to(cards, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "back.out(1.15)"
        }, "-=0.25");
      } else {
        // --- CLOSE ANIMATION (Tuck back in) ---
        const offsets = getOffsets();
        const tl = gsap.timeline();

        // 1. Animate cards back into folder
        tl.to(cards, {
          x: (idx) => offsets[idx]?.dx || 0,
          y: (idx) => offsets[idx]?.dy || 0,
          scale: 0.1,
          opacity: 0,
          rotation: () => gsap.utils.random(-15, 15),
          stagger: 0.04,
          duration: 0.5,
          ease: "power2.in"
        });

        // 2. Close folder cover
        tl.to(".folder-front-flap", {
          rotateX: -10,
          translateY: 0,
          duration: 0.4,
          ease: "power2.in"
        }, "-=0.2");
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isOpen]);

  return (
    <>

      <section
        ref={sectionRef}
        className="section py-16"
        style={{
          backgroundColor: "#faf6f0",
          borderBottom: "1.5px solid #222222",
          overflow: "hidden",
          position: "relative",
          zIndex: 15 // Keeps category section above the blurred page backdrop!
        }}
      >
        <div className="container max-w-7xl mx-auto px-4">
          {/* Title / Section Heading */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="eyebrow" style={{ color: "var(--color-orange)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px", fontSize: "0.85rem" }}>Browse Our Range</span>
            <h2 className="section-heading" style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              margin: "4px 0 0"
            }}>
              {categorySection.heading}
            </h2>
            {/* Decorative wave divider */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
              <svg viewBox="0 0 100 8" style={{ width: "120px", height: "8px" }}>
                <path d="M 0 4 Q 25 1 50 4 T 100 4" fill="none" stroke="var(--color-blue)" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* 1. Purple File Folder (Center Top) */}
          <div
            ref={folderRef}
            className="folder-graphic"
            style={{
              position: "relative",
              width: "280px",
              height: "180px",
              margin: "0 auto 48px",
              perspective: "1000px",
              zIndex: 10
            }}
          >
            {/* Folder Back Cover */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#8B5CF6", // Purple
                border: "3px solid #222222",
                borderRadius: "16px",
                boxShadow: "6px 6px 0px #222222",
                zIndex: 1
              }}
            >
              {/* Tab */}
              <div
                style={{
                  position: "absolute",
                  top: "-16px",
                  left: "20px",
                  width: "90px",
                  height: "18px",
                  backgroundColor: "#8B5CF6",
                  borderTop: "3px solid #222222",
                  borderLeft: "3px solid #222222",
                  borderRight: "3px solid #222222",
                  borderRadius: "8px 8px 0 0"
                }}
              />
            </div>

            {/* Folder Front Cover Flap */}
            <div
              className="folder-front-flap"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "70%",
                backgroundColor: "#A78BFA", // Lighter purple
                border: "3px solid #222222",
                borderRadius: "0 0 16px 16px",
                zIndex: 8,
                transformOrigin: "bottom center",
                transform: "rotateX(-10deg)",
                pointerEvents: "none"
              }}
            >
              {/* Slanted cutoff design */}
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "20px",
                  width: "40%",
                  height: "13px",
                  backgroundColor: "#A78BFA",
                  borderTop: "3px solid #222222",
                  borderLeft: "3px solid #222222",
                  borderRadius: "8px 0 0 0",
                  transform: "skewX(-20deg)"
                }}
              />

              {/* Label Badge on front cover */}
              <div style={{
                position: "absolute",
                bottom: "12px",
                left: "16px",
                backgroundColor: "#FAF6F0",
                border: "1.5px solid #222222",
                borderRadius: "20px",
                padding: "2px 10px",
                fontSize: "0.68rem",
                fontWeight: "bold",
                color: "#222222",
                boxShadow: "1.5px 1.5px 0px #222222"
              }}>
                📂 Categories
              </div>
            </div>
          </div>

          {/* 2. Arranged Category Cards Grid */}
          <div
            ref={cardsParentRef}
            className="flex flex-wrap justify-center gap-6 relative z-10 w-full max-w-5xl mx-auto"
          >
            {categories.map((cat, idx) => {
              const cardBg = cat.color || brandColors[idx % brandColors.length];
              const textInk = cat.textColor || "#222222";

              return (
                <div
                  key={cat.label}
                  ref={(el) => { cardsRef.current[idx] = el; }}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0"
                  style={{ opacity: 0 }} // Pre-hidden to avoid initial flash of unstyled content
                >
                  <Link
                    to={cat.href}
                    style={{
                      display: "block",
                      border: "1.5px solid #222222",
                      borderRadius: "20px",
                      overflow: "hidden",
                      textDecoration: "none",
                      color: textInk,
                      backgroundColor: cardBg,
                      boxShadow: "0 4px 0 #222222",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = "0 8px 0 #222222";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 0 #222222";
                    }}
                  >
                    {/* Category Card Image Container */}
                    <div style={{
                      height: "150px",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: "1.5px solid #222222",
                      overflow: "hidden",
                      padding: "8px"
                    }}>
                      <img
                        src={cat.image}
                        alt={cat.label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                      />
                    </div>

                    {/* Tag label */}
                    <div style={{
                      padding: "16px 12px",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      lineHeight: "1.3",
                      minHeight: "54px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {cat.label}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
