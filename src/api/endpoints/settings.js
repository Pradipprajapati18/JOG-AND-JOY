import * as mockApi from '../mockApi';

const TABLE = 'settings';

export const settingsApi = {
  get: async () => {
    const list = await mockApi.list(TABLE);
    let dbSettings = list.data[0] || null;
    
    // Merge with any extended settings stored in localStorage
    // (workaround since Supabase schema cannot be altered automatically here)
    const localSettings = JSON.parse(localStorage.getItem('extendedSettings') || '{}');
    
    return dbSettings ? { ...dbSettings, ...localSettings } : localSettings;
  },
  update: async (patch) => {
    const list = await mockApi.list(TABLE);
    
    // Save to localStorage so it persists across refreshes
    const existingLocal = JSON.parse(localStorage.getItem('extendedSettings') || '{}');
    localStorage.setItem('extendedSettings', JSON.stringify({ ...existingLocal, ...patch }));

    if (list.data.length > 0) {
      try {
        const res = await mockApi.update(TABLE, list.data[0].id, patch);
        return { ...res, ...existingLocal, ...patch };
      } catch (err) {
        // If it throws because of unknown columns, we still have it in localStorage
        console.warn("Some fields may not have synced to cloud:", err.message);
        return { ...list.data[0], ...existingLocal, ...patch };
      }
    } else {
      try {
        const res = await mockApi.create(TABLE, patch);
        return { ...res, ...existingLocal, ...patch };
      } catch (err) {
        console.warn("Some fields may not have synced to cloud:", err.message);
        return { ...existingLocal, ...patch };
      }
    }
  },
};
