import React from 'react';
import { Heart, Camera, Sparkles } from 'lucide-react';

const instaPhotos = [
  { id: 1, image: '/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (1).webp', likes: '1.2k', position: 'center' },
  { id: 2, image: '/gallery_images/insta_feature_2.png', likes: '980', position: 'top' },
  { id: 3, image: '/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (12).webp', likes: '2.4k', position: 'center' },
  { id: 4, image: '/gallery_images/insta_feature_4.png', likes: '1.8k', position: 'top' }
];

export default function InstagramGallery() {
  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <a href="https://www.instagram.com/jognjoy_official?mdxt=MXdncjk4NDlqczFxcA==" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-full bg-[#FFD6BA]/50 hover:bg-[#FFD6BA] text-orange-900 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 transition-colors cursor-pointer">
            <Camera className="w-3.5 h-3.5 text-[#EF4A45]" /> @jognjoy_official
          </a>
          <a href="https://www.instagram.com/jognjoy_official?mdxt=MXdncjk4NDlqczFxcA==" target="_blank" rel="noopener noreferrer" className="block hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Follow Us On <span className="text-[#EF4A45]">Instagram</span>
            </h2>
          </a>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Tag #JogAndJoyKids on Instagram for a chance to be featured on our official page!
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instaPhotos.map((photo) => (
            <a
              key={photo.id}
              href="https://www.instagram.com/jognjoy_official?mdxt=MXdncjk4NDlqczFxcA=="
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block cursor-pointer"
            >
              <img
                src={photo.image}
                alt="Instagram Kids Fashion"
                style={{ objectPosition: photo.position || 'center' }}
                className={`w-full h-full object-cover ${photo.position === 'top' ? 'object-top' : 'object-center'} group-hover:scale-110 transition-transform duration-500`}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white space-y-2">
                <Camera className="w-8 h-8 text-[#FFD800]" />
                <span className="text-xs font-black flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-white text-white" /> {photo.likes} Likes
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
