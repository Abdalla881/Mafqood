export const APP_CONFIG = {
  API_BASE_URL:
    (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  API_VERSION: (import.meta as any)?.env?.VITE_API_VERSION || "v1",
  API_TIMEOUT: Number((import.meta as any)?.env?.VITE_API_TIMEOUT) || 10000,
} as const;

export const apiUrl = (endpoint: string): string => {
  return `${APP_CONFIG.API_BASE_URL}/api/${APP_CONFIG.API_VERSION}${endpoint}`;
};
