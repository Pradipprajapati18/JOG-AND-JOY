import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCircles() {
  const categories = [
    {
      name: "Kids",
      path: "/kids",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Men",
      path: "/products?category=Male",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8">
            Shop by Department
          </h2>

          <div className="flex flex-row flex-wrap justify-center gap-8 sm:gap-16">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-[#EF4A45] transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:-translate-y-2">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <span className="text-sm sm:text-base font-black text-slate-800 group-hover:text-[#EF4A45] transition-colors uppercase tracking-widest">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
