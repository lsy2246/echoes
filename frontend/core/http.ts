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

    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return { ...options, headers };
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let message = `${response.statusText} (${response.status})`;

      try {
        if (contentType?.includes("application/json")) {
          const error = await response.json();
          message = error.message || message;
        } else {
          message = this.getErrorMessage(response.status);
        }
      } catch (e) {
        console.error("解析响应错误:", e);
      }

      throw new Error(message);
    }

    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json")
      ? response.json()
      : response.text();
  }

  private getErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      0: "网络连接失败",
      401: "未授权访问",
      403: "禁止访问",
      404: "资源不存在",
      405: "方法不允许",
      500: "服务器错误",
      502: "网关错误",
      503: "服务不可用",
      504: "网关超时",
    };
    return messages[status] || `请求失败 (${status})`;
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
      throw error.name === "AbortError" ? new Error("请求超时") : error;
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
}
