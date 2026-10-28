import { normalizeColor } from './helpers';

/**
 * Parse age range from a string like "7-8 Years", "10-12 Year", "0-3 Months", "4Y"
 * Returns [minYears, maxYears] or null
 */
export function parseAgeRange(str) {
  if (!str) return null;
  const s = String(str).toLowerCase().replace(/–/g, '-').trim();

  // Months e.g. 0-3 Months, 3-6m, 6-12 month
  const mMatch = s.match(/(\d+)\s*-\s*(\d+)\s*(?:m|months|month)/);
  if (mMatch) {
    return [parseInt(mMatch[1], 10) / 12, parseInt(mMatch[2], 10) / 12];
  }

  // Years range e.g. 7-8 years, 10-12 year, 12-14y
  const yMatch = s.match(/(\d+)\s*-\s*(\d+)/);
  if (yMatch) {
    return [parseInt(yMatch[1], 10), parseInt(yMatch[2], 10)];
  }

  // Single year e.g. 4y, 4 year
  const singleMatch = s.match(/(\d+)\s*(?:y|years|year)?/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    return [val, val];
  }

  return null;
}

/**
 * Checks if a product matches any selected age filters
 */
export function matchesAge(product, selectedAges) {
  if (!selectedAges || selectedAges.length === 0) return true;

  const allSizes = [
    ...(product.sizes || []),
    ...(product.variants || []).map((v) => v.size)
  ].filter(Boolean);

  return selectedAges.some((selectedAge) => {
    const fRange = parseAgeRange(selectedAge);

    // 1. Check product ageGroup
    if (product.ageGroup) {
      const pRange = parseAgeRange(product.ageGroup);
      if (fRange && pRange) {
        if (Math.max(fRange[0], pRange[0]) <= Math.min(fRange[1], pRange[1])) return true;
      }
      const normSel = selectedAge.toLowerCase().replace(/–/g, '-').replace(/s\b/g, '').trim();
      const normProd = product.ageGroup.toLowerCase().replace(/–/g, '-').replace(/s\b/g, '').trim();
      if (normProd.includes(normSel) || normSel.includes(normProd)) return true;
    }

    // 2. Check product sizes
    return allSizes.some((size) => {
      const sRange = parseAgeRange(size);
      if (fRange && sRange) {
        if (Math.max(fRange[0], sRange[0]) <= Math.min(fRange[1], sRange[1])) return true;
      }
      const normSel = selectedAge.toLowerCase().replace(/–/g, '-').replace(/s\b/g, '').trim();
      const normSize = size.toLowerCase().replace(/–/g, '-').replace(/s\b/g, '').trim();
      return normSize.includes(normSel) || normSel.includes(normSize);
    });
  });
}

/**
 * Checks if a product matches any selected color filters
 */
export function matchesColor(product, selectedColors) {
  if (!selectedColors || selectedColors.length === 0) return true;

  const productColors = [];
  (product.colors || []).forEach((c) => {
    if (typeof c === 'string') {
      productColors.push(c);
    } else if (c && typeof c === 'object') {
      if (c.name) productColors.push(c.name);
      const norm = normalizeColor(c);
      if (norm.name && norm.name !== 'Standard') productColors.push(norm.name);
    }
  });

  (product.variants || []).forEach((v) => {
    if (v.colorName) productColors.push(v.colorName);
    const norm = normalizeColor({ hex: v.colorHex, name: v.colorName });
    if (norm.name && norm.name !== 'Standard') productColors.push(norm.name);
  });

  const uniqueProductColors = [...new Set(productColors.map((c) => String(c).toLowerCase().trim()))];

  return selectedColors.some((filterColor) => {
    const fc = String(filterColor).toLowerCase().trim();
    return uniqueProductColors.some((pc) => {
      if (pc === fc) return true;
      if (pc.includes(fc) || fc.includes(pc)) return true;

      // Color family synonyms
      if ((fc.includes('navy') || fc.includes('blue')) && (pc.includes('navy') || pc.includes('blue'))) return true;
      if ((fc.includes('olive') || fc.includes('green') || fc.includes('khaki')) && (pc.includes('olive') || pc.includes('green') || pc.includes('khaki'))) return true;
      if ((fc.includes('grey') || fc.includes('gray')) && (pc.includes('grey') || pc.includes('gray'))) return true;
      if ((fc.includes('red') || fc.includes('maroon') || fc.includes('burgundy')) && (pc.includes('red') || pc.includes('maroon') || pc.includes('burgundy'))) return true;
      if ((fc.includes('yellow') || fc.includes('mustard') || fc.includes('gold')) && (pc.includes('yellow') || pc.includes('mustard') || pc.includes('gold'))) return true;
      if ((fc.includes('pink') || fc.includes('rose') || fc.includes('peach')) && (pc.includes('pink') || pc.includes('rose') || pc.includes('peach'))) return true;

      return false;
    });
  });
}

/**
 * Checks if a product matches any selected size filters
 */
export function matchesSize(product, selectedSizes) {
  if (!selectedSizes || selectedSizes.length === 0) return true;

  const productSizes = [
    ...(product.sizes || []),
    ...(product.variants || []).map((v) => v.size)
  ].filter(Boolean).map((s) => String(s).toLowerCase().replace(/–/g, '-').trim());

  return selectedSizes.some((selectedSize) => {
    const sel = String(selectedSize).toLowerCase().replace(/–/g, '-').trim();
    return productSizes.some((ps) => ps === sel || ps.includes(sel) || sel.includes(ps));
  });
}

/**
 * Checks if a product matches any selected category/type filters
 */
export function matchesCategory(product, selectedTypes, dbCategories = []) {
  if (!selectedTypes || selectedTypes.length === 0) return true;

  const catMap = new Map();
  dbCategories.forEach((c) => {
    if (c.id && c.label) {
      catMap.set(c.id.toLowerCase(), c.label.toLowerCase());
      catMap.set(c.label.toLowerCase(), c.id.toLowerCase());
    }
  });

  const pCatId = (product.categoryId || '').toLowerCase().trim();
  const pCatLabel = (product.categoryLabel || product.category || '').toLowerCase().trim();
  const pCatResolved = catMap.get(pCatId) || '';

  return selectedTypes.some((type) => {
    const t = String(type).toLowerCase().trim();
    if (pCatId === t || pCatLabel === t || pCatResolved === t) return true;
    if (pCatLabel && (pCatLabel.includes(t) || t.includes(pCatLabel))) return true;
    return false;
  });
}

/**
 * Checks if a product matches any selected price range filters
 */
export function matchesPrice(product, selectedPrices, priceOptions = []) {
  if (!selectedPrices || selectedPrices.length === 0) return true;

  const rawPrice = product.price ?? product.basePrice ?? 0;
  const numPrice = typeof rawPrice === 'number'
    ? rawPrice
    : Number(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;

  return selectedPrices.some((priceId) => {
    const pr = priceOptions.find((p) => p.id === priceId);
    if (pr) {
      const min = pr.min !== undefined ? pr.min : 0;
      const max = pr.max !== undefined ? pr.max : 999999;
      return numPrice >= min && numPrice <= max;
    }
    // Fallback legacy support
    if (priceId === 'low' || priceId === 'pr-under-499') return numPrice < 500;
    if (priceId === 'mid' || priceId === 'pr-500-999') return numPrice >= 500 && numPrice <= 999;
    if (priceId === 'high' || priceId === 'pr-1000-1499' || priceId === 'pr-above-1500') return numPrice >= 1000;
    return false;
  });
}

/**
 * Natural sort for garment sizes (months -> years -> letter sizes)
 */
export function sortSizes(sizesArray) {
  const getOrderScore = (size) => {
    if (!size) return 9999;
    const s = String(size).toLowerCase().replace(/–/g, '-').trim();
    const m = s.match(/(\d+)\s*-\s*(\d+)\s*(?:m|months|month)/);
    if (m) return parseInt(m[1], 10);
    const y = s.match(/(\d+)\s*(?:-\s*(\d+))?\s*(?:y|year|years)?/);
    if (y && !isNaN(parseInt(y[1], 10))) return 100 + parseInt(y[1], 10);
    const letters = { xxs: 300, xs: 301, s: 302, m: 303, l: 304, xl: 305, xxl: 306, '2xl': 306, '3xl': 307 };
    if (letters[s]) return letters[s];
    return 500;
  };

  return [...sizesArray].sort((a, b) => {
    const scoreA = getOrderScore(a);
    const scoreB = getOrderScore(b);
    if (scoreA !== scoreB) return scoreA - scoreB;
    return String(a).localeCompare(String(b), undefined, { numeric: true });
  });
}

