import React from 'react';
import { Link } from 'react-router-dom';
import './ShopByDepartment.css';
import newArrivalsMobile from '../../assets/new-arrivals-mobile.jpg';
import newArrivalsDesktop from '../../assets/new-arrivals-desktop-custom.webp';
import allProductsCustom from '../../assets/all-products-custom.jpg';
import allProductsDesktop from '../../assets/all-products-desktop.webp';
import kidsWearMobile from '../../assets/kids-wear-mobile.webp';
import kidsWearTab from '../../assets/kids-wear-tab.jpg';
import kidsWearDesktop from '../../assets/kids-wear-desktop.webp';

const departments = [
  {
    title: 'New Arrival',
    link: '/new-arrivals',
    image: newArrivalsMobile,
    desktopImage: newArrivalsDesktop
  },
  {
    title: 'All Products',
    link: '/products',
    image: allProductsCustom,
    desktopImage: allProductsDesktop
  },
  {
    title: 'Kids Wear',
    link: '/kids',
    image: kidsWearMobile,
    tabImage: kidsWearTab,
    desktopImage: kidsWearDesktop
  }
];

export default function ShopByDepartment() {
  return (
    <div className="sbd-container">
      {departments.map((dept, index) => (
        <section key={index} className="sbd-hero">
          <Link to={dept.link} className="sbd-hero-inner block cursor-pointer" id={`sbd-section-${index}`}>
            <figure
              className="sbd-figure"
              style={{
                '--bg-mobile': `url(${dept.image})`,
                '--bg-tab': dept.tabImage ? `url(${dept.tabImage})` : `url(${dept.desktopImage || dept.image})`,
                '--bg-desktop': `url(${dept.desktopImage || dept.image})`,
                '--bg-pos-desktop': dept.title === 'New Arrival' ? 'center 20%' : (dept.title === 'All Products' ? 'center 25%' : (dept.title === 'Kids Wear' ? 'center 25%' : 'center')),
                '--bg-pos-tab': dept.title === 'Kids Wear' ? 'center 60px' : 'center',
                '--bg-pos-mobile': 'center'
              }}
            >
              {dept.title !== 'New Arrival' && dept.title !== 'All Products' && dept.title !== 'Kids Wear' && <div className="sbd-overlay"></div>}
            </figure>
            {dept.title !== 'New Arrival' && dept.title !== 'All Products' && dept.title !== 'Kids Wear' && (
              <div className="sbd-hero__title">
                {dept.title}
              </div>
            )}
          </Link>
        </section>
      ))}
      <section className="sbd-content">
        {/* Empty section to ensure next regular page content scrolls over nicely */}
      </section>
    </div>
  );
}
