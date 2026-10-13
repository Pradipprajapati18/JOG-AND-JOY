import React from 'react';
import CardNav from './CardNav';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenProfile }) {
  const { user } = useAuth();
  
  const navItems = [
    {
      label: "Shop",
      bgColor: "#FFD800",
      textColor: "#0f172a",
      links: [
        { label: "New Arrivals", href: "/new-arrivals", ariaLabel: "New Arrivals" },
        { label: "All Products", href: "/products", ariaLabel: "All Products" },
        { label: "Kids Wear", href: "/kids", ariaLabel: "Kids Wear" },
        { label: "Best Sellers", href: "/products", ariaLabel: "Best Sellers" }
      ]
    },
    {
      label: "Explore",
      bgColor: "#AEE6FF",
      textColor: "#0f172a",
      links: [
        { label: "About Us", href: "/about-us", ariaLabel: "About Us" },
        { label: "Why Choose Us", href: "/why-us", ariaLabel: "Why Choose Us" },
        { label: "Contact Us", href: "/contact-us", ariaLabel: "Contact Us" }
      ]
    },
    {
      label: "Business",
      bgColor: "#EF4A45",
      textColor: "#ffffff",
      links: [
        { label: "Distributors", href: "/distributor-network", ariaLabel: "Distributors" }
      ]
    }
  ];

  if (user?.role === 'ADMIN') {
    navItems.find(n => n.label === "Business").links.push({
      label: "Admin Dashboard", 
      href: "/admin", 
      ariaLabel: "Admin Dashboard"
    });
  }

  return (
    <div className="sticky top-0 w-full h-16 md:h-20 bg-white block select-none z-50 shadow-md transition-all duration-300">
      <CardNav
        items={navItems}
        baseColor="transparent"
        menuButtonColor="#0f172a"
        openMenuButtonColor="#0f172a"
        accentColor="#EF4A45"
        onOpenProfile={onOpenProfile}
      />
    </div>
  );
}
