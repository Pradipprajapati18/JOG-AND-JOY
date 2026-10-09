import React from 'react';

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, idx) => (
        <div key={idx} className="rounded-3xl bg-white border border-slate-200 p-4 space-y-4 animate-pulse">
          <div className="w-full h-64 rounded-2xl bg-slate-200" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
