"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './ImageTrail.css';

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getMouseDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

function getNewPosition(position, offset, arr) {
  const realOffset = Math.abs(offset) % arr.length;
  if (position - realOffset >= 0) {
    return position - realOffset;
  } else {
    return arr.length - (realOffset - position);
  }
}

class ImageItem {
  constructor(el) {
    this.el = el;
    this.inner = el.querySelector('.content__img-inner');
    this.defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
    this.getRect();
    this.resizeListener = () => {
      gsap.set(this.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener('resize', this.resizeListener);
  }

  getRect() {
    this.rect = this.el.getBoundingClientRect();
  }

  destroy() {
    window.removeEventListener('resize', this.resizeListener);
  }
}

class TrailController {
  constructor(container, variant) {
    this.container = container;
    this.variant = variant;
    this.images = Array.from(container.querySelectorAll('.content__img')).map(img => new ImageItem(img));
    this.threshold = 50;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.active = true;
    
    this.isAutoDrifting = true;
    this.autoDriftTime = 0;
    this.idleTimeout = null;
    this.lastAngle = 0;
    this.visibleImagesCount = 0;
    this.visibleImagesTotal = Math.min(9, this.images.length - 1);

    const rect = this.container.getBoundingClientRect();
    this.mousePos = { x: rect.width / 2 || 400, y: rect.height / 2 || 300 };
    this.cacheMousePos = { ...this.mousePos };
    this.lastMousePos = { ...this.mousePos };

    window.addEventListener('mousemove', this.handlePointer);
    window.addEventListener('touchmove', this.handlePointer);
    window.addEventListener('mousemove', this.initRender);
    window.addEventListener('touchmove', this.initRender);
  }

  handlePointer = (ev) => {
    if (!this.active) return;
    const rect = this.container.getBoundingClientRect();
    const clientX = 'touches' in ev && ev.touches.length > 0 ? ev.touches[0].clientX : ev.clientX;
    const clientY = 'touches' in ev && ev.touches.length > 0 ? ev.touches[0].clientY : ev.clientY;

    const isInside = (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );

    if (isInside) {
      this.isAutoDrifting = false;
      this.mousePos = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };

      if (this.idleTimeout) clearTimeout(this.idleTimeout);
      this.idleTimeout = setTimeout(() => {
        this.isAutoDrifting = true;
        this.autoDriftTime = Math.random() * 100;
      }, 3000);
    }
  };

  initRender = (ev) => {
    if (!this.active) return;
    const rect = this.container.getBoundingClientRect();
    const clientX = 'touches' in ev && ev.touches.length > 0 ? ev.touches[0].clientX : ev.clientX;
    const clientY = 'touches' in ev && ev.touches.length > 0 ? ev.touches[0].clientY : ev.clientY;

    this.isAutoDrifting = false;
    this.mousePos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    this.cacheMousePos = { ...this.mousePos };

    requestAnimationFrame(() => this.render());

    window.removeEventListener('mousemove', this.initRender);
    window.removeEventListener('touchmove', this.initRender);
  };

  render() {
    if (!this.active) return;

    if (this.isAutoDrifting) {
      this.autoDriftTime += 0.007;
      const rect = this.container.getBoundingClientRect();
      const w = rect.width || 800;
      const h = rect.height || 600;

      this.mousePos = {
        x: (w / 2) + Math.sin(this.autoDriftTime * 1.6) * (w * 0.35),
        y: (h / 2) + Math.cos(this.autoDriftTime * 1.1) * (h * 0.28)
      };
    }

    const dx = this.mousePos.x - this.lastMousePos.x;
    const dy = this.mousePos.y - this.lastMousePos.y;
    const distance = Math.hypot(dx, dy);

    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.12);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.12);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }

    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }

    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.images.length - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    if (!img || !img.el || !img.rect) return;

    gsap.killTweensOf(img.el);

    const onStart = () => {
      this.activeImagesCount++;
      this.isIdle = false;
    };

    const onComplete = () => {
      this.activeImagesCount--;
      if (this.activeImagesCount === 0) {
        this.isIdle = true;
      }
    };

    const vx = this.mousePos.x - this.cacheMousePos.x;
    const vy = this.mousePos.y - this.cacheMousePos.y;
    const speed = Math.hypot(vx, vy);

    let ndx = speed !== 0 ? vx / speed : 0;
    let ndy = speed !== 0 ? vy / speed : 0;

    switch (this.variant) {
      case 2:
        gsap
          .timeline({ onStart, onComplete })
          .fromTo(
            img.el,
            {
              opacity: 1,
              scale: 0,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2
            },
            {
              duration: 0.4,
              ease: 'power1',
              scale: 1,
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2
            },
            0
          )
          .fromTo(
            img.inner,
            { scale: 2.8, filter: 'brightness(250%)' },
            { duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%)' },
            0
          )
          .to(
            img.el,
            { duration: 0.4, ease: 'power2', opacity: 0, scale: 0.2 },
            0.45
          );
        break;

      case 3:
        gsap
          .timeline({ onStart, onComplete })
          .fromTo(
            img.el,
            {
              opacity: 1,
              scale: 0,
              zIndex: this.zIndexVal,
              xPercent: 0,
              yPercent: 0,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2
            },
            {
              duration: 0.4,
              ease: 'power1',
              scale: 1,
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2
            },
            0
          )
          .fromTo(
            img.inner,
            { scale: 1.2 },
            { duration: 0.4, ease: 'power1', scale: 1 },
            0
          )
          .to(
            img.el,
            {
              duration: 0.6,
              ease: 'power2',
              opacity: 0,
              scale: 0.2,
              xPercent: () => gsap.utils.random(-30, 30),
              yPercent: -200
            },
            0.6
          );
        break;

      case 4:
        gsap
          .timeline({ onStart, onComplete })
          .fromTo(
            img.el,
            {
              opacity: 1,
              scale: 0,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2
            },
            {
              duration: 0.4,
              ease: 'power1',
              scale: 1,
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2
            },
            0
          )
          .fromTo(
            img.inner,
            {
              scale: 2,
              filter: `brightness(${Math.max((400 * speed) / 100, 100)}%) contrast(${Math.max((400 * speed) / 100, 100)}%)`
            },
            { duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%) contrast(100%)' },
            0
          )
          .to(img.el, { duration: 0.4, ease: 'power3', opacity: 0 }, 0.4)
          .to(
            img.el,
            {
              duration: 1.5,
              ease: 'power4',
              x: `+=${ndx * (speed / 100) * 110}`,
              y: `+=${ndy * (speed / 100) * 110}`
            },
            0.05
          );
        break;

      case 5:
        let angle = Math.atan2(vy, vx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        if (angle > 90 && angle <= 270) angle += 180;
        const isMovingClockwise = angle >= this.lastAngle;
        this.lastAngle = angle;
        let startAngle = isMovingClockwise ? angle - 10 : angle + 10;

        gsap
          .timeline({ onStart, onComplete })
          .fromTo(
            img.el,
            {
              opacity: 1,
              filter: 'brightness(80%)',
              scale: 0.1,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2,
              rotation: startAngle
            },
            {
              duration: 1,
              ease: 'power2',
              scale: 1,
              filter: 'brightness(100%)',
              x: this.mousePos.x - img.rect.width / 2 + ndx * (speed / 150) * 70,
              y: this.mousePos.y - img.rect.height / 2 + ndy * (speed / 150) * 70,
              rotation: this.lastAngle
            },
            0
          )
          .to(img.el, { duration: 0.4, ease: 'expo', opacity: 0 }, 0.5)
          .to(
            img.el,
            {
              duration: 1.5,
              ease: 'power4',
              x: `+=${ndx * (speed / 150) * 120}`,
              y: `+=${ndy * (speed / 150) * 120}`
            },
            0.05
          );
        break;

      case 6:
        const scaleFactor = 0.3 + (2 - 0.3) * Math.min(speed / 200, 1);
        const brightnessValue = 0 + (1.3 - 0) * Math.min(speed / 70, 1);
        const blurValue = 20 + (0 - 20) * Math.min(speed / 90, 1);
        const grayscaleValue = 6 + (0 - 6) * Math.min(speed / 90, 1);

        gsap
          .timeline({ onStart, onComplete })
          .fromTo(
            img.el,
            {
              opacity: 1,
              scale: 0,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2
            },
            {
              duration: 0.8,
              ease: 'power3',
              scale: scaleFactor,
              filter: `grayscale(${grayscaleValue * 100}%) brightness(${brightnessValue * 100}%) blur(${blurValue}px)`,
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2
            },
            0
          )
          .fromTo(img.inner, { scale: 2 }, { duration: 0.8, ease: 'power3', scale: 1 }, 0)
          .to(img.el, { duration: 0.4, ease: 'power3.in', opacity: 0, scale: 0.2 }, 0.45);
        break;

      case 7:
        this.visibleImagesCount++;
        const scaleVal = gsap.utils.random(0.5, 1.6);
        gsap
          .timeline({
            onStart,
            onComplete: () => {}
          })
          .fromTo(
            img.el,
            {
              scale: scaleVal - Math.max(gsap.utils.random(0.2, 0.6), 0),
              rotationZ: 0,
              opacity: 1,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2
            },
            {
              duration: 0.4,
              ease: 'power3',
              scale: scaleVal,
              rotationZ: gsap.utils.random(-3, 3),
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2
            },
            0
          );

        if (this.visibleImagesCount >= this.visibleImagesTotal) {
          const lastInQueue = getNewPosition(this.imgPosition, this.visibleImagesTotal, this.images);
          const oldImg = this.images[lastInQueue];
          if (oldImg && oldImg.el) {
            gsap.to(oldImg.el, {
              duration: 0.4,
              ease: 'power4',
              opacity: 0,
              scale: 1.3,
              onComplete
            });
          }
        }
        break;

      case 8:
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relX = this.mousePos.x - centerX;
        const relY = this.mousePos.y - centerY;

        const rotationX = -(relY / centerY) * 30;
        const rotationY = (relX / centerX) * 30;

        const distanceFromCenter = Math.hypot(relX, relY);
        const maxDistance = Math.hypot(centerX, centerY);
        const proportion = distanceFromCenter / maxDistance;
        const zValue = proportion * 1200 - 600;
        const normalizedZ = (zValue + 600) / 1200;
        const brightness = 0.2 + normalizedZ * 2.3;

        gsap
          .timeline({ onStart, onComplete })
          .set(this.container, { perspective: 1000 }, 0)
          .fromTo(
            img.el,
            {
              opacity: 1,
              z: 0,
              scale: 1 + zValue / 1000,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2,
              rotationX,
              rotationY,
              filter: `brightness(${brightness})`
            },
            {
              duration: 1,
              ease: 'expo',
              scale: 1 + zValue / 1000,
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2,
              rotationX,
              rotationY
            },
            0
          )
          .to(img.el, { duration: 0.4, ease: 'power2', opacity: 0, z: -800 }, 0.3);
        break;

      default:
        gsap
          .timeline({ onStart, onComplete })
          .fromTo(
            img.el,
            {
              opacity: 1,
              scale: 1,
              zIndex: this.zIndexVal,
              x: this.cacheMousePos.x - img.rect.width / 2,
              y: this.cacheMousePos.y - img.rect.height / 2
            },
            {
              duration: 0.4,
              ease: 'power1',
              x: this.mousePos.x - img.rect.width / 2,
              y: this.mousePos.y - img.rect.height / 2
            },
            0
          )
          .to(
            img.el,
            { duration: 0.4, ease: 'power3', opacity: 0, scale: 0.2 },
            0.4
          );
        break;
    }
  }

  destroy() {
    this.active = false;
    window.removeEventListener('mousemove', this.handlePointer);
    window.removeEventListener('touchmove', this.handlePointer);
    window.removeEventListener('mousemove', this.initRender);
    window.removeEventListener('touchmove', this.initRender);
    this.images.forEach(img => img.destroy());
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
  }
}

const productLabels = [
  "Kids Cotton Tees",
  "Men's Track Pants",
  "Cozy Pajama Suits",
  "Vibrant Girls Frocks",
  "Comfortable Shorts",
  "Cozy Nightwear",
  "Breathable Boxers",
  "Active Jogger Pants"
];

const mobileCoordinates = [
  { top: "12%", left: "8%" },
  { top: "8%", right: "8%" },
  { top: "36%", left: "12%" },
  { top: "32%", right: "10%" },
  { top: "62%", left: "6%" },
  { top: "66%", right: "8%" }
];

export default function ImageTrail({ items = [], variant = 1 }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const timeoutsRef = useRef({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current || items.length === 0) return;

    const controller = new TrailController(containerRef.current, variant);
    return () => controller.destroy();
  }, [variant, items, isMobile]);

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const handleCardTap = (idx) => {
    if (!isMobile) return;

    if (timeoutsRef.current[idx]) {
      clearTimeout(timeoutsRef.current[idx]);
    }

    setActiveCard(idx);

    timeoutsRef.current[idx] = setTimeout(() => {
      setActiveCard(null);
    }, 2000);
  };

  if (isMobile) {
    const collageItems = items.slice(0, 6);

    return (
      <div 
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          overflow: "hidden",
          pointerEvents: "auto"
        }}
      >
        {collageItems.map((url, i) => {
          const coords = mobileCoordinates[i] || { top: "20%", left: "20%" };
          const isActive = activeCard === i;

          return (
            <div
              key={i}
              onClick={() => handleCardTap(i)}
              style={{
                position: "absolute",
                ...coords,
                width: "110px",
                aspectRatio: "1.1",
                borderRadius: "12px",
                overflow: "hidden",
                border: isActive ? "2.5px solid #C83B2B" : "1px solid #e0e0e0",
                boxShadow: isActive ? "0 8px 24px rgba(200, 59, 43, 0.25)" : "none",
                opacity: isActive ? 1 : 0.15,
                filter: isActive ? "grayscale(0%) blur(0px)" : "grayscale(100%) blur(2px)",
                transform: isActive ? "scale(1.15) rotate(0deg)" : `scale(1) rotate(${(i % 2 === 0 ? 3 : -3)}deg)`,
                transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                cursor: "pointer",
                zIndex: isActive ? 100 : 5
              }}
            >
              <div 
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />

              {isActive && (
                <div 
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(200, 59, 43, 0.95)",
                    color: "#ffffff",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    textAlign: "center",
                    padding: "4px 2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    animation: "pulse-gentle 1s infinite"
                  }}
                >
                  {productLabels[i] || "Jog & Joy"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="content" ref={containerRef}>
      {items.map((url, i) => (
        <div className="content__img" key={i}>
          <div className="content__img-inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}
