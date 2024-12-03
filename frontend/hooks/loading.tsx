import React, { createContext, useState, useContext } from "react";

interface LoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/25 dark:bg-black/40 z-[999999]">
          <div className="loading-spinner mb-2" />
          <div className="text-custom-p-light dark:text-custom-p-dark text-sm">
            加载中...
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          border-top-color: #3B82F6;
          animation: spin 0.8s linear infinite;
        }

        .dark .loading-spinner {
          border: 3px solid rgba(96, 165, 250, 0.2);
          border-top-color: #60A5FA;
        }
      `}</style>
    </LoadingContext.Provider>
  );
};

// 全局loading实例
let globalShowLoading: (() => void) | null = null;
let globalHideLoading: (() => void) | null = null;

export const LoadingContainer: React.FC = () => {
  const { showLoading, hideLoading } = useContext(LoadingContext);

  React.useEffect(() => {
    globalShowLoading = showLoading;
    globalHideLoading = hideLoading;
    return () => {
      globalShowLoading = null;
      globalHideLoading = null;
    };
  }, [showLoading, hideLoading]);

  return null;
};

// 导出loading方法
export const loading = {
  show: () => {
    if (!globalShowLoading) {
      console.warn("Loading system not initialized");
      return;
    }
    globalShowLoading();
  },
  hide: () => {
    if (!globalHideLoading) {
      console.warn("Loading system not initialized");
      return;
    }
    globalHideLoading();
  },
};
