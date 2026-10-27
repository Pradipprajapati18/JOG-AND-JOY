import React from 'react';

const InstagramBadge = () => (
  <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#fdf497] via-[#fd5949] to-[#285AEB] flex items-center justify-center shadow-md shrink-0">
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  </div>
);

const FacebookBadge = () => (
  <div className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center shadow-md shrink-0">
    <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </div>
);

const YouTubeBadge = () => (
  <div className="w-8 h-8 rounded-xl bg-[#CD2019] flex items-center justify-center shadow-md shrink-0">
    <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  </div>
);

const LinkedInBadge = () => (
  <div className="w-8 h-8 rounded-xl bg-[#0077B5] flex items-center justify-center shadow-md shrink-0">
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  </div>
);

const socialPhotos = [
  {
    id: 1,
    image: '/gallery_images/follow_us_instagram.jpg',
    likes: '1.2k',
    position: 'top',
    platform: 'Instagram',
    link: 'https://www.instagram.com/jognjoy_official?mdxt=MXdncjk4NDlqczFxcA==',
    Badge: InstagramBadge
  },
  {
    id: 2,
    image: '/gallery_images/insta_feature_2.png',
    likes: '980',
    position: 'top',
    platform: 'Facebook',
    link: 'https://www.facebook.com/profile.php?id=61594924757967',
    Badge: FacebookBadge
  },
  {
    id: 3,
    image: '/gallery_images/WhatsApp Image 2026-10-02 at 17.09.51 (12).webp',
    likes: '2.4k',
    position: 'center',
    platform: 'YouTube',
    link: 'https://www.youtube.com/@JognJoy_official',
    Badge: YouTubeBadge
  },
  {
    id: 4,
    image: '/gallery_images/insta_feature_4.png',
    likes: '1.8k',
    position: 'top',
    platform: 'LinkedIn',
    link: 'https://linkedin.com',
    Badge: LinkedInBadge
  }
];

export default function InstagramGallery() {
  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Follow <span className="text-[#EF4A45]">Us</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Tag #JogAndJoyKids on Instagram for a chance to be featured on our official page!
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socialPhotos.map((photo) => (
            <a
              key={photo.id}
              href={photo.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow on ${photo.platform}`}
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block cursor-pointer"
            >
              <img
                src={photo.image}
                alt={`${photo.platform} Kids Fashion`}
                style={{ objectPosition: photo.position || 'center' }}
                className={`w-full h-full object-cover ${photo.position === 'top' ? 'object-top' : 'object-center'} group-hover:scale-110 transition-transform duration-500`}
              />

              {/* Small Corner App Icon */}
              <div className="absolute top-3.5 right-3.5 z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                <photo.Badge />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                <div className="scale-125 transition-transform duration-300 group-hover:scale-135 drop-shadow-lg">
                  <photo.Badge />
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
