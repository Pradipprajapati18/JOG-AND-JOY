import React, { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import BrandStrip from '../components/home/BrandStrip';
import ShopByDepartment from '../components/home/ShopByDepartment';
import FeaturedCollections from '../components/home/FeaturedCollections';

import SeasonalCollection from '../components/home/SeasonalCollection';
import LimitedTimeOffers from '../components/home/LimitedTimeOffers';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CustomerReviews from '../components/home/CustomerReviews';
import InstagramGallery from '../components/home/InstagramGallery';
import NewsletterSection from '../components/home/NewsletterSection';
import QuickViewModal from '../components/ui/QuickViewModal';

export default function Home() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <main className="w-full bg-white relative overflow-hidden">
      {/* Page Sections */}
      <div className="relative z-10 space-y-0">
        <HeroSection />
        <BrandStrip />
        <ShopByDepartment />
        <FeaturedCollections />
        <LimitedTimeOffers />

        <SeasonalCollection onQuickView={setQuickViewProduct} />
        <WhyChooseUs />
        <CustomerReviews />
        <InstagramGallery />
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </main>
  );
}
