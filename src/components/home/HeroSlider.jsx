import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { getImageUrl } from '../../utils/getImageUrl';

const slides = [
  {
    id: 1,
    tag: 'Summer Vibes Collection 2026',
    title: 'Color Scheme For Summer Vibes',
    subtitle: 'High performance activewear engineered with breathable tech fabrics and dynamic street style.',
    bgImage: getImageUrl('hero_summer.webp'),
    fallbackBg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
  },
  {
    id: 2,
    tag: 'Athleisure Fashion',
    title: 'Love Is In The Wear',
    subtitle: 'From kids activewear to men’s premium trackpants — precision stitched for supreme comfort.',
    bgImage: getImageUrl('cat_men_joggers.webp'),
    fallbackBg: 'https://images.unsplash.com/photo-1483721074892-4a85807d2d2d?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Discover Athleisure',
    ctaLink: '/collections',
  },
  {
    id: 3,
    tag: 'B2B Wholesale Partner',
    title: 'Join Our Global Distributor Network',
    subtitle: 'Empowering retail partners nationwide with high-demand fashion apparel and fast supply chains.',
    bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Become a Distributor',
    ctaLink: '/distributors',
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-slate-950">
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-slate-950/60 z-10" />
          
          <img
            src={slide.bgImage}
            alt={slide.title}
            className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = slide.fallbackBg;
            }}
          />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            {slides[currentSlide].tag}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
            {slides[currentSlide].title.split(' ').map((word, i) => (
              <span key={i} className={word.toLowerCase().includes('summer') || word.toLowerCase().includes('wear') || word.toLowerCase().includes('distributor') ? 'text-gradient-lime block sm:inline' : 'inline'}>
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            {slides[currentSlide].subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a href={slides[currentSlide].ctaLink}>
              <Button size="lg" icon={ArrowRight}>
                {slides[currentSlide].ctaText}
              </Button>
            </a>

            <a href="https://maulisales.com/jogjoy/" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg">
                Explore External Shop
              </Button>
            </a>
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-900/60 border border-white/10 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-slate-950 transition-all hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-900/60 border border-white/10 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-slate-950 transition-all hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide ? 'w-8 h-2.5 bg-[#ccff00]' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
