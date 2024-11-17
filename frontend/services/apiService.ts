// File path: /d:/data/echoes/frontend/services/apiService.ts

/**
 * ApiConfig接口用于配置API服务的基本信息。
 */
interface ApiConfig {
    baseURL: string; // API的基础URL
    timeout?: number; // 请求超时时间（可选）
}

export class ApiService {
    private static instance: ApiService; // ApiService的单例实例
    private baseURL: string; // API的基础URL
    private timeout: number; // 请求超时时间

    /**
     * 构造函数用于初始化ApiService实例。
     * @param config ApiConfig配置对象
     */
    private constructor(config: ApiConfig) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout || 10000; // 默认超时时间为10000毫秒
    }

    /**
     * 获取ApiService的单例实例。
     * @param config 可选的ApiConfig配置对象
     * @returns ApiService实例
     */
    public static getInstance(config?: ApiConfig): ApiService {
        if (!this.instance && config) {
            this.instance = new ApiService(config);
        }
        return this.instance;
    }

    /**
     * 获取系统令牌。
     * @returns Promise<string> 返回系统令牌
     * @throws Error 如果未找到凭据或请求失败
     */
    private async getSystemToken(): Promise<string> {
        const credentials = localStorage.getItem('system_credentials');
        if (!credentials) {
            throw new Error('System credentials not found');
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/system`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(JSON.parse(credentials)),
            });

            if (!response.ok) {
                throw new Error('Failed to get system token');
            }

            const { token } = await response.json();
            return token;
        } catch (error) {
            console.error('Error getting system token:', error);
            throw error;
        }
    }

    /**
     * 发起API请求。
     * @param endpoint 请求的API端点
     * @param options 请求选项
     * @param requiresAuth 是否需要身份验证（默认为true）
     * @returns Promise<T> 返回API响应数据
     * @throws Error 如果请求超时或发生其他错误
     */
    public async request<T>(
        endpoint: string,
        options: RequestInit = {},
        requiresAuth = true
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const headers = new Headers(options.headers);
            
            if (requiresAuth) {
                const token = await this.getSystemToken();
                headers.set('Authorization', `Bearer ${token}`);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data as T;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

export default ApiService.getInstance({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});