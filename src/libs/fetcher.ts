let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);

  if (res.status === 401) {
    if (isRefreshing) {
      // 現在トークンをリフレッシュ中の場合は、処理が終わるまで待機
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        // 待機後、再試行
        return fetch(url, options);
      });
    }

    isRefreshing = true;
    
    return new Promise(async (resolve, reject) => {
      try {
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });

        if (!refreshRes.ok) {
          // リフレッシュ失敗時はログインページへ
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
        
        processQueue(null, 'refreshed');
        // 元のリクエストを再試行して解決
        resolve(fetch(url, options));
      } catch (error) {
        processQueue(error as Error, null);
        reject(error);
      } finally {
        isRefreshing = false;
      }
    });
  }

  return res;
};