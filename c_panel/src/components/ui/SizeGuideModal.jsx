import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('cm'); // 'cm' | 'inches'

  if (!isOpen) return null;

  const sizeChart = [
    {
        age: '0–6 Months',
        size: '0',
        heightCm: '55–67',
        weightKg: '4–8',
        chestCm: '41',
        waistCm: '40',
        heightIn: '21–26',
        weightLbs: '9-17',
        chestIn: '16.1',
        waistIn: '15.7'
    },
    {
        age: '1–2 Yrs',
        size: '16',
        heightCm: '80-86',
        weightKg: '10-12',
        chestCm: '50',
        waistCm: '49',
        heightIn: '31-34',
        weightLbs: '22-26',
        chestIn: '19.6',
        waistIn: '19.2'
    },
    {
        age: '2–3 Yrs',
        size: '18',
        heightCm: '88–96',
        weightKg: '12-14',
        chestCm: '54',
        waistCm: '51',
        heightIn: '34–38',
        weightLbs: '26-30',
        chestIn: '21.2',
        waistIn: '20.0'
    },
    {
        age: '3–4 Yrs',
        size: '20',
        heightCm: '98–104',
        weightKg: '14-16',
        chestCm: '56',
        waistCm: '53',
        heightIn: '38–41',
        weightLbs: '30-35',
        chestIn: '22.0',
        waistIn: '20.8'
    },
    {
        age: '4–5 Yrs',
        size: '22',
        heightCm: '104–110',
        weightKg: '15-18',
        chestCm: '58',
        waistCm: '54',
        heightIn: '41–43',
        weightLbs: '33-39',
        chestIn: '22.8',
        waistIn: '21.2'
    },
    {
        age: '5–6 Yrs',
        size: '24',
        heightCm: '110–116',
        weightKg: '18-20',
        chestCm: '60',
        waistCm: '55',
        heightIn: '43–45',
        weightLbs: '39-44',
        chestIn: '23.6',
        waistIn: '21.6'
    },
    {
        age: '6–7 Yrs',
        size: '26',
        heightCm: '116–122',
        weightKg: '20-23',
        chestCm: '62',
        waistCm: '57',
        heightIn: '45–48',
        weightLbs: '44-50',
        chestIn: '24.4',
        waistIn: '22.4'
    },
    {
        age: '7–8 Yrs',
        size: '28',
        heightCm: '122–128',
        weightKg: '23-25',
        chestCm: '64',
        waistCm: '58',
        heightIn: '48–50',
        weightLbs: '50-55',
        chestIn: '25.2',
        waistIn: '22.8'
    },
    {
        age: '8–9 Yrs',
        size: '30',
        heightCm: '128–134',
        weightKg: '25-30',
        chestCm: '66',
        waistCm: '60',
        heightIn: '50–53',
        weightLbs: '55-66',
        chestIn: '26.0',
        waistIn: '23.6'
    },
    {
        age: '9–10 Yrs',
        size: '32',
        heightCm: '134–140',
        weightKg: '30-32',
        chestCm: '70',
        waistCm: '62',
        heightIn: '53–55',
        weightLbs: '66-70',
        chestIn: '27.5',
        waistIn: '24.4'
    },
    {
        age: '10–12 Yrs',
        size: '34',
        heightCm: '140–152',
        weightKg: '32-40',
        chestCm: '74',
        waistCm: '64',
        heightIn: '55–60',
        weightLbs: '70-88',
        chestIn: '29.1',
        waistIn: '25.2'
    },
    {
        age: '12–14 Yrs',
        size: '36',
        heightCm: '152–160',
        weightKg: '40-48',
        chestCm: '80',
        waistCm: '67',
        heightIn: '60–63',
        weightLbs: '88-105',
        chestIn: '31.5',
        waistIn: '26.4'
    },
    {
        age: '14–16 Yrs',
        size: '38',
        heightCm: '160–168',
        weightKg: '48-55',
        chestCm: '86',
        waistCm: '70',
        heightIn: '63–66',
        weightLbs: '105-121',
        chestIn: '33.8',
        waistIn: '27.5'
    }
];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#AEE6FF] text-slate-900 flex items-center justify-center shrink-0">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Kids Official Size Guide 📐
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Standardized measurements for bio-washed combed cotton activewear.
              </p>
            </div>
          </div>

          {/* Unit Toggle Switch */}
          <div className="flex items-center justify-between mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> Measure comfortably over light clothing
            </span>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  unit === 'cm' ? 'bg-[#EF4A45] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CM
              </button>
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  unit === 'inches' ? 'bg-[#EF4A45] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                INCHES
              </button>
            </div>
          </div>

          {/* Size Chart Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FFF8EC] text-slate-800 font-black border-b border-amber-100">
                <tr>
                  <th className="p-3">Age</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Height</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Waist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {sizeChart.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="p-3 font-extrabold text-slate-900">{row.age}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#AEE6FF]/40 text-slate-800 text-[11px] font-black">
                        {row.size}
                      </span>
                    </td>
                    <td className="p-3">{unit === 'cm' ? row.heightCm + ' cm' : row.heightIn + ' in'}</td>
                    <td className="p-3">{unit === 'cm' ? row.weightKg + ' kg' : row.weightLbs + ' lbs'}</td>
                    <td className="p-3">{unit === 'cm' ? row.chestCm + ' cm' : row.chestIn + ' in'}</td>
                    <td className="p-3">{unit === 'cm' ? row.waistCm + ' cm' : row.waistIn + ' in'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fit Guarantee Tip */}
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Fit Guarantee:</strong> If the apparel doesn't fit your little one perfectly, enjoy easy 3-day hassle-free size exchanges!
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
