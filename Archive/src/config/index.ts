// API Configuration - Dynamic environment detection for local and live production servers

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost/multimilla/lsapp/public/api/v1';
    }
  }

  // Live production backend URL
  return 'https://backend.multimilla.com/public/api/v1';
};

export const BASE_URL = getApiBaseUrl();
