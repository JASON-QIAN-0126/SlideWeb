const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (isDevelopment) {
    return 'http://localhost:5005';
  }
  
  if (isProduction) {
    const hostname = window.location.hostname;
    
    if (hostname.includes('slide-web-frontend.vercel.app')) {
      return 'https://slide-web-backend.vercel.app';
    }
    
    if (hostname.includes('netlify.app')) {
      return 'https://slide-web-backend.vercel.app';
    }
    
    return 'https://slide-web-backend.vercel.app';
  }
  
  return 'http://localhost:5005';
};

const API_BASE_URL = getApiBaseUrl();

export { API_BASE_URL, isDevelopment, isProduction };

if (isDevelopment) {
  console.log('🔧 开发环境配置:', {
    API_BASE_URL,
    NODE_ENV: import.meta.env.MODE,
    isDevelopment,
    isProduction
  });
} 