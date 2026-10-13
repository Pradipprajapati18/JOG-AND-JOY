import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function FeaturedCollections() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Section Header */}
        <div className="mb-10 flex flex-col items-center">
          <span className="px-5 py-2 rounded-full bg-[#AEE6FF]/40 text-sky-900 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-600" /> Handpicked Fashion
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mt-6">
            Featured <span className="text-[#EF4A45]">Collections</span>
          </h2>
          <p className="mt-6 text-slate-500 font-medium max-w-xl text-lg sm:text-xl">
            Discover our carefully curated wardrobe designed to bring joy and style to every adventure.
          </p>
        </div>

        {/* Centralized Beautiful Button */}
        <div className="mt-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#EF4A45] via-[#AEE6FF] to-[#EF4A45] rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200 animate-tilt"></div>
          <Link
            to="/products"
            className="relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#EF4A45] text-white rounded-full font-black text-lg sm:text-xl overflow-hidden transition-all duration-300 transform group-hover:scale-105 active:scale-95 shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore our collection
              <ArrowUpRight className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 h-full w-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </Link>
        </div>

      </div>
    </section>
  );
}
