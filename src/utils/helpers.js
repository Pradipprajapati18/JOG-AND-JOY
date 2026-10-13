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

export const getColorName = (hexOrName, fallbackName = '') => {
  if (!hexOrName) return fallbackName || 'Standard';
  if (fallbackName && fallbackName !== hexOrName && !fallbackName.startsWith('#')) {
    return fallbackName;
  }
  const clean = String(hexOrName).trim().toLowerCase();
  if (STANDARD_COLOR_NAMES[clean]) return STANDARD_COLOR_NAMES[clean];
  if (clean.startsWith('#')) {
    if (clean.length === 4) {
      const expanded = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
      if (STANDARD_COLOR_NAMES[expanded]) return STANDARD_COLOR_NAMES[expanded];
    }
    return fallbackName || clean.toUpperCase();
  }
  return hexOrName;
};
