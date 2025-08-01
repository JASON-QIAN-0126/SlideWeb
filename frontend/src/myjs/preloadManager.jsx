import { useEffect, useState } from 'react';

// 预加载管理器
class PreloadManager {
  constructor() {
    this.preloadedModules = new Map();
    this.preloadPromises = new Map();
    this.preloadStatus = new Map();
    this.listeners = new Set();
  }

  // 添加状态变化监听器
  addStatusListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 通知状态变化
  notifyStatusChange() {
    this.listeners.forEach(listener => listener(this.getStatus()));
  }

  // 获取整体状态
  getStatus() {
    const total = this.preloadStatus.size;
    const completed = Array.from(this.preloadStatus.values()).filter(status => status === 'completed').length;
    const failed = Array.from(this.preloadStatus.values()).filter(status => status === 'failed').length;
    const loading = Array.from(this.preloadStatus.values()).filter(status => status === 'loading').length;

    return {
      total,
      completed,
      failed,
      loading,
      isComplete: completed + failed === total && total > 0,
      progress: total > 0 ? (completed / total) * 100 : 0
    };
  }

  // 预加载模块
  async preloadModule(moduleName, importFn) {
    if (this.preloadedModules.has(moduleName)) {
      return this.preloadedModules.get(moduleName);
    }

    if (this.preloadPromises.has(moduleName)) {
      return this.preloadPromises.get(moduleName);
    }

    // 设置加载状态
    this.preloadStatus.set(moduleName, 'loading');
    this.notifyStatusChange();

    const promise = importFn().then(module => {
      this.preloadedModules.set(moduleName, module);
      this.preloadPromises.delete(moduleName);
      this.preloadStatus.set(moduleName, 'completed');
      this.notifyStatusChange();
      console.log(`✅ 预加载完成: ${moduleName}`);
      return module;
    }).catch(error => {
      console.error(`❌ 预加载失败: ${moduleName}`, error);
      this.preloadPromises.delete(moduleName);
      this.preloadStatus.set(moduleName, 'failed');
      this.notifyStatusChange();
      throw error;
    });

    this.preloadPromises.set(moduleName, promise);
    return promise;
  }

  // 获取已预加载的模块
  getPreloadedModule(moduleName) {
    return this.preloadedModules.get(moduleName);
  }

  // 检查模块是否已预加载
  isPreloaded(moduleName) {
    return this.preloadedModules.has(moduleName);
  }

  // 获取模块状态
  getModuleStatus(moduleName) {
    return this.preloadStatus.get(moduleName) || 'not-started';
  }

  // 预加载所有关键模块
  async preloadCriticalModules() {
    const preloadTasks = [
      // 预加载dashboard
      this.preloadModule('dashboard', () => import('./dashboard')),
      // 预加载examplePresentation
      this.preloadModule('examplePresentation', () => import('./examplePresentation')),
      // 预加载SlideThumbnail
      this.preloadModule('SlideThumbnail', () => import('./SlideThumbnail')),
      // 预加载Particles组件
      this.preloadModule('Particles', () => import('../components/Particles/Particles')),
      // 预加载API工具
      this.preloadModule('api', () => import('../utils/api')),
    ];

    try {
      await Promise.allSettled(preloadTasks);
      console.log('🎉 所有关键模块预加载完成');
    } catch (error) {
      console.error('预加载过程中出现错误:', error);
    }
  }

  // 预加载特定模块（用于按需加载）
  async preloadSpecificModule(moduleName) {
    const moduleMap = {
      'dashboard': () => import('./dashboard'),
      'examplePresentation': () => import('./examplePresentation'),
      'SlideThumbnail': () => import('./SlideThumbnail'),
      'Particles': () => import('../components/Particles/Particles'),
      'api': () => import('../utils/api'),
    };

    const importFn = moduleMap[moduleName];
    if (!importFn) {
      throw new Error(`未知模块: ${moduleName}`);
    }

    return this.preloadModule(moduleName, importFn);
  }
}

// 创建全局预加载管理器实例
export const preloadManager = new PreloadManager();

// 预加载组件
export function PreloadManagerComponent() {
  const [preloadStatus, setPreloadStatus] = useState({
    isPreloading: false,
    completed: 0,
    total: 0,
    progress: 0,
    error: null
  });

  useEffect(() => {
    const unsubscribe = preloadManager.addStatusListener((status) => {
      setPreloadStatus({
        isPreloading: status.loading > 0,
        completed: status.completed,
        total: status.total,
        progress: status.progress,
        error: status.failed > 0 ? '部分模块加载失败' : null
      });
    });

    const startPreloading = async () => {
      try {
        await preloadManager.preloadCriticalModules();
      } catch (error) {
        console.error('预加载失败:', error);
      }
    };

    // 延迟开始预加载，避免阻塞页面初始渲染
    const timer = setTimeout(startPreloading, 1000);
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 这个组件不渲染任何内容，只是后台预加载
  return null;
}

// 预加载状态指示器组件
export function PreloadStatusIndicator() {
  const [status, setStatus] = useState(preloadManager.getStatus());

  useEffect(() => {
    const unsubscribe = preloadManager.addStatusListener(setStatus);
    return unsubscribe;
  }, []);

  if (status.isComplete || status.total === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <div style={{
        width: '60px',
        height: '4px',
        background: '#333',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${status.progress}%`,
          height: '100%',
          background: '#4CAF50',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <span>预加载中... {Math.round(status.progress)}%</span>
    </div>
  );
}

// 使用预加载模块的Hook
export function usePreloadedModule(moduleName, importFn) {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModule = async () => {
      try {
        setLoading(true);
        const loadedModule = await preloadManager.preloadModule(moduleName, importFn);
        setModule(loadedModule);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleName, importFn]);

  return { module, loading, error };
}

export default preloadManager; 