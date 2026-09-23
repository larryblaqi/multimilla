import { Capacitor } from '@capacitor/core';

// API Configuration - Dynamic environment detection for local and live production servers

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Native mobile app (Android / iOS) MUST ALWAYS use live backend URL
  if (Capacitor.isNativePlatform()) {
    return 'https://backend.multimilla.com/public/api/v1';
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Only use localhost endpoint during local development
    if (import.meta.env.DEV && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return 'http://localhost/multimilla/lsapp/public/api/v1';
    }
  }

  // Live production backend URL
  return 'https://backend.multimilla.com/public/api/v1';
};

export const BASE_URL = getApiBaseUrl();
