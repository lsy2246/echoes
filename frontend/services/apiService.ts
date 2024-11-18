interface ApiConfig {
    baseURL: string;
    timeout?: number;
}

export class ApiService {
    private static instance: ApiService;
    private baseURL: string;
    private timeout: number;

    private constructor(config: ApiConfig) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout || 10000;
    }

    public static getInstance(config?: ApiConfig): ApiService {
        if (!this.instance && config) {
            this.instance = new ApiService(config);
        }
        return this.instance;
    }

    private async getSystemToken(): Promise<string> {
        const username = import.meta.env.VITE_SYSTEM_USERNAME;
        const password = import.meta.env.VITE_SYSTEM_PASSWORD;
        if (!username || !password ) {
            throw new Error('Failed to obtain the username or password of the front-end system');
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/token/system`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get system token');
            }

            const data = await response.text();
            return data;
        } catch (error) {
            console.error('Error getting system token:', error);
            throw error;
        }
    }

    public async request<T>(
        endpoint: string,
        options: RequestInit = {},
        toekn ?: string
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const headers = new Headers(options.headers);
            
            if (toekn) {
                headers.set('Authorization', `Bearer ${toekn}`);
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
