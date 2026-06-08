const normalizeBase = (value) => String(value || '').trim().replace(/\/$/, '');

const baseFromEnv = normalizeBase(import.meta.env.VITE_API_URL);

export const getApiUrl = (path = '') => {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
  if (!baseFromEnv) return normalizedPath;
  return `${baseFromEnv}${normalizedPath}`;
};
