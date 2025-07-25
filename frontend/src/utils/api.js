import axios from 'axios';
import { API_BASE_URL, isDevelopment } from '../config.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (isDevelopment) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('认证失败，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('权限不足');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error('请求失败:', data?.error || error.message);
      }
    } else if (error.request) {
      // 网络错误
      console.error('网络连接失败，请检查网络状态');
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API方法封装
export const api = {
  // 认证相关
  auth: {
    login: (email, password) => 
      apiClient.post('/admin/auth/login', { email, password }),
    
    register: (email, password, name) => 
      apiClient.post('/admin/auth/register', { email, password, name }),
    
    logout: () => 
      apiClient.post('/admin/auth/logout'),
    
    getProfile: () => 
      apiClient.get('/admin/auth/profile'),
  },
  
  // 数据存储相关
  store: {
    get: () => 
      apiClient.get('/store'),
    
    update: (store) => 
      apiClient.put('/store', { store }),
  },
};

export { apiClient };
export { API_BASE_URL }; 