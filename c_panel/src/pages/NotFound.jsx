import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#FFF8EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-100 text-center space-y-4">
        <div className="text-6xl font-black text-[#EF4A45] tracking-tight">404</div>
        <div className="text-4xl">🎈</div>
        <h2 className="text-2xl font-black text-slate-900">Oops! Page Wandered Off</h2>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          The page you are looking for might have been moved, renamed, or is taking an afternoon nap!
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="w-full py-3.5 rounded-full bg-[#EF4A45] text-white font-extrabold text-xs shadow-md hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
