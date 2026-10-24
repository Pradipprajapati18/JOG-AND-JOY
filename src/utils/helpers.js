export const createSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const exportToCSV = (data, filename) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const csvRows = data.map(row => 
    Object.values(row).map(val => {
      let stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape quotes and wrap in quotes if there's a comma
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        stringVal = `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(',')
  );
  
  const csvString = [headers, ...csvRows].join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const STANDARD_COLOR_NAMES = {
  '#000000': 'Black',
  '#ffffff': 'White',
  '#ff0000': 'Red',
  '#0000ff': 'Blue',
  '#000080': 'Navy',
  '#ffff00': 'Yellow',
  '#ffc0cb': 'Pink',
  '#808000': 'Olive',
  '#aee6ff': 'Sky Blue',
  '#a7d8ff': 'Baby Blue',
  '#ff7a59': 'Coral Orange',
  '#22c55e': 'Green',
  '#16a34a': 'Emerald Green',
  '#a855f7': 'Purple',
  '#f97316': 'Orange',
  '#6b7280': 'Grey',
  '#4b5563': 'Charcoal',
  '#92400e': 'Brown',
  '#fef08a': 'Cream',
  '#1e293b': 'Dark Slate',
  '#3b82f6': 'Royal Blue',
  '#ec4899': 'Hot Pink',
  '#14b8a6': 'Teal',
  '#84cc16': 'Lime Green',
  '#d97706': 'Amber'
};

export const STANDARD_NAME_TO_HEX = {
  'black': '#000000',
  'white': '#ffffff',
  'red': '#ff0000',
  'blue': '#0000ff',
  'navy': '#000080',
  'yellow': '#ffff00',
  'pink': '#ffc0cb',
  'olive': '#808000',
  'sky blue': '#aee6ff',
  'baby blue': '#a7d8ff',
  'coral orange': '#ff7a59',
  'coral pink': '#ff8e8e',
  'coral': '#ff7a59',
  'green': '#22c55e',
  'emerald green': '#16a34a',
  'emerald': '#16a34a',
  'purple': '#a855f7',
  'orange': '#f97316',
  'grey': '#6b7280',
  'gray': '#6b7280',
  'charcoal': '#4b5563',
  'brown': '#92400e',
  'cream': '#fef08a',
  'dark slate': '#1e293b',
  'royal blue': '#3b82f6',
  'hot pink': '#ec4899',
  'teal': '#14b8a6',
  'lime green': '#84cc16',
  'lime': '#84cc16',
  'amber': '#d97706',
  'mint green': '#b8f2d0',
  'mint': '#b8f2d0',
  'soft lavender': '#d8c7ff',
  'lavender': '#d8c7ff'
};

export const normalizeColor = (color) => {
  if (!color) return { hex: '#1E293B', name: 'Standard' };

  if (typeof color === 'string') {
    const trimmed = color.trim();
    if (trimmed.startsWith('#')) {
      const hex = trimmed.toLowerCase();
      return { hex: trimmed, name: getColorName(hex) };
    }
    if (/^[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
      const hex = `#${trimmed}`;
      return { hex, name: getColorName(hex) };
    }
    const lowerName = trimmed.toLowerCase();
    const hex = STANDARD_NAME_TO_HEX[lowerName] || '#1E293B';
    return { hex, name: trimmed };
  }

  if (typeof color === 'object') {
    let rawHex = color.hex || color.color || color.colorHex || color.code || '';
    let rawName = color.name || color.colorName || color.label || '';

    if (rawHex && typeof rawHex === 'string') {
      rawHex = rawHex.trim();
      if (!rawHex.startsWith('#') && /^[0-9A-Fa-f]{3,8}$/.test(rawHex)) {
        rawHex = `#${rawHex}`;
      }
    }

    if (!rawHex && rawName) {
      rawHex = STANDARD_NAME_TO_HEX[rawName.toLowerCase()] || '#1E293B';
    }

    if (!rawName && rawHex) {
      rawName = getColorName(rawHex);
    }

    return {
      hex: rawHex || '#1E293B',
      name: rawName || 'Standard',
      ...(color.image ? { image: color.image } : {})
    };
  }

  return { hex: '#1E293B', name: 'Standard' };
};

export const getColorName = (hexOrName, fallbackName = '') => {
  if (!hexOrName) return fallbackName || 'Standard';
  if (typeof hexOrName === 'object') {
    return hexOrName.name || hexOrName.colorName || hexOrName.label || getColorName(hexOrName.hex || hexOrName.colorHex || hexOrName.color) || fallbackName || 'Standard';
  }
  let clean = String(hexOrName).trim();
  if (!clean.startsWith('#') && /^[0-9A-Fa-f]{3,8}$/.test(clean)) {
    clean = '#' + clean;
  }
  const lower = clean.toLowerCase();
  if (STANDARD_COLOR_NAMES[lower]) return STANDARD_COLOR_NAMES[lower];
  if (clean.startsWith('#')) {
    if (clean.length === 4) {
      const expanded = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
      if (STANDARD_COLOR_NAMES[expanded.toLowerCase()]) return STANDARD_COLOR_NAMES[expanded.toLowerCase()];
    }
    return fallbackName || clean.toUpperCase();
  }
  return String(hexOrName);
};

export const formatColorName = (colorName, colorHex = null) => {
  if (colorName) {
    if (typeof colorName === 'string') {
      if (colorName.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(colorName.trim())) {
        return getColorName(colorName);
      }
      return colorName;
    }
    if (typeof colorName === 'object') {
      return colorName.name || colorName.colorName || colorName.label || getColorName(colorName.hex || colorName.colorHex || colorHex);
    }
  }
  return getColorName(colorHex);
};

export const formatColorHex = (color) => {
  return normalizeColor(color).hex;
};

