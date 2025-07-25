// 环境配置
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API 基础URL配置
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 如果是开发环境
  if (isDevelopment) {
    return 'http://localhost:5005';
  }
  
  // 如果是生产环境，自动检测当前域名
  if (isProduction) {
    const hostname = window.location.hostname;
    
    // 如果部署在Vercel，使用对应的后端地址
    if (hostname.includes('slide-web-frontend.vercel.app')) {
      return 'https://slide-web-backend.vercel.app';
    }
    
    // 如果是其他部署平台，可以在这里添加对应的逻辑
    if (hostname.includes('netlify.app')) {
      return 'https://slide-web-backend.vercel.app'; // 或者您的后端部署地址
    }
    
    // 默认生产环境地址
    return 'https://slide-web-backend.vercel.app';
  }
  
  // 兜底地址
  return 'http://localhost:5005';
};

const API_BASE_URL = getApiBaseUrl();

// 导出配置
export { API_BASE_URL, isDevelopment, isProduction };

// 在开发环境下打印当前配置，便于调试
if (isDevelopment) {
  console.log('🔧 开发环境配置:', {
    API_BASE_URL,
    NODE_ENV: import.meta.env.MODE,
    isDevelopment,
    isProduction
  });
} 