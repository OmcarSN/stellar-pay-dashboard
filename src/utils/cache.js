export const setCache = (key, value, ttlSeconds = 30) => {
  const item = { value, expiry: Date.now() + ttlSeconds * 1000 };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getCache = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const item = JSON.parse(raw);
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

export const clearCache = (key) => localStorage.removeItem(key);
