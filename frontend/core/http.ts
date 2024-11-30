export interface ErrorResponse {
  title: string;
  message: string;
}

export class HttpClient {
  private static instance: HttpClient;
  private timeout: number;

  private constructor(timeout = 10000) {
    this.timeout = timeout;
  }

  public static getInstance(timeout?: number): HttpClient {
    if (!this.instance) {
      this.instance = new HttpClient(timeout);
    }
    return this.instance;
  }

  private async setHeaders(options: RequestInit = {}): Promise<RequestInit> {
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return { ...options, headers };
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let message = `${response.statusText}`;

      try {
        if (contentType?.includes("application/json")) {
          const error = await response.json();
          message = error.message || message;
        } else {
          const textError = await response.text();
          message = (response.status != 404 && textError) || message;
        }
      } catch (e) {
        console.error("解析响应错误:", e);
      }

      const errorResponse: ErrorResponse = {
        title: this.getErrorMessage(response.status),
        message: message
      };
      
      throw errorResponse;
    }

    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json")
      ? response.json()
      : response.text();
  }

  private getErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      0: "网络连接失败",
      400: "请求错误",
      401: "未授权访问",
      403: "禁止访问",
      404: "资源不存在",
      405: "方法不允许",
      500: "服务器错误",
      502: "网关错误",
      503: "服务不可用",
      504: "网关超时",
    };
    return messages[status] || `请求失败`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    prefix = "api",
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const config = await this.setHeaders(options);
      const url = endpoint.startsWith(`/__/${prefix}`)
        ? endpoint
        : `/__/${prefix}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
        credentials: "include",
        mode: "cors",
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      if (error.name === "AbortError") {
        const errorResponse: ErrorResponse = {
          title: "请求超时",
          message: "服务器响应时间过长，请稍后重试"
        };
        throw errorResponse;
      }
      if ((error as ErrorResponse).title && (error as ErrorResponse).message) {
        throw error;
      }
      const errorResponse: ErrorResponse = {
        title: "未知错误",
        message: error.message || "发生未知错误"
      };
      throw errorResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options, "api");
  }

  public async dev<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, options, "express");
  }

  public async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.api<T>(endpoint, { ...options, method: "GET" });
  }

  public async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {},
  ): Promise<T> {
    return this.api<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {},
  ): Promise<T> {
    return this.api<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    return this.api<T>(endpoint, { ...options, method: "DELETE" });
  }

  public async systemToken<T>(): Promise<T> {

    const formData = {
    "username": import.meta.env.VITE_API_USERNAME,
    "password": import.meta.env.VITE_API_PASSWORD
  }
  
    return this.api<T>("/auth/token/system", {  method: "POST",body: JSON.stringify(formData), });
  }
}
