import * as mockApi from '../mockApi';

const TABLE = 'settings';

export const settingsApi = {
  get: async () => {
    const list = await mockApi.list(TABLE);
    const item = list.data[0] || null;
    if (item && !item.filterPanels && typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('jj_filter_panels');
        if (stored) item.filterPanels = JSON.parse(stored);
      } catch {}
    }
    return item;
  },
  update: async (patch) => {
    const list = await mockApi.list(TABLE);
    
    if (list.data.length > 0) {
      const res = await mockApi.update(TABLE, list.data[0].id, patch);
      return res;
    } else {
      const res = await mockApi.create(TABLE, patch);
      return res;
    }
  },
};
