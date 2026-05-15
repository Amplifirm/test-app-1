const store: Record<string, string> = {};
const AsyncStorage = {
  getItem: async (k: string) => (k in store ? store[k] : null),
  setItem: async (k: string, v: string) => { store[k] = v; },
  removeItem: async (k: string) => { delete store[k]; },
  clear: async () => { Object.keys(store).forEach((k) => delete store[k]); },
  getAllKeys: async () => Object.keys(store),
  multiGet: async (keys: string[]) => keys.map((k) => [k, store[k] ?? null]),
  multiSet: async (pairs: [string, string][]) => { pairs.forEach(([k, v]) => { store[k] = v; }); },
  multiRemove: async (keys: string[]) => { keys.forEach((k) => delete store[k]); },
};
export default AsyncStorage;
