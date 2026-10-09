import React from 'react';
import FeaturedCollections from '../components/home/FeaturedCollections';
import CategoryCircles from '../components/home/CategoryCircles';
import SeasonalCollection from '../components/home/SeasonalCollection';

export default function Collections() {
  return (
    <div className="py-6">
      <FeaturedCollections />
      <CategoryCircles />
      <SeasonalCollection />
    </div>
  );
}
