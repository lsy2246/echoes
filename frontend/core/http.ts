import { DEFAULT_CONFIG } from "~/env";
export interface ErrorResponse {
  title: string;
  message: string;
  detail?: string;
}

export class HttpClient {
  private static instance: HttpClient;
  private readonly timeout: number;

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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorDetail = {
        status: response.status,
        statusText: response.statusText,
        message: "",
        raw: "",
      };

      try {
        if (contentType?.includes("application/json")) {
          const error = await response.json();
          errorDetail.message = error.message || "";
          errorDetail.raw = JSON.stringify(error, null, 2);
        } else {
          const textError = await response.text();
          errorDetail.message = textError;
          errorDetail.raw = textError;
        }
      } catch (e) {
        console.error("[Response Parse Error]:", e);
        errorDetail.message = "响应解析失败";
        errorDetail.raw = e instanceof Error ? e.message : String(e);
      }

      switch (response.status) {
        case 400:
          errorDetail.message = errorDetail.message || "请求参数错误";
          break;
        case 401:
          errorDetail.message = "未授权访问";
          break;
        case 403:
          errorDetail.message = "访问被禁止";
          break;
        case 404:
          errorDetail.message = "请求的资源不存在";
          break;
        case 500:
          errorDetail.message = "服务器内部错误";
          break;
        case 502:
          errorDetail.message = "网关错误";
          break;
        case 503:
          errorDetail.message = "服务暂时不可用";
          break;
        case 504:
          errorDetail.message = "网关超时";
          break;
      }

      const errorResponse: ErrorResponse = {
        title: `${errorDetail.status} ${errorDetail.statusText}`,
        message: errorDetail.message,
        detail: `请求URL: ${response.url}\n状态码: ${errorDetail.status}\n原始错误: ${errorDetail.raw}`,
      };

      console.error("[HTTP Error]:", errorResponse);
      throw errorResponse;
    }

    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      return (await response.text()) as T;
    } catch (e) {
      console.error("[Response Parse Error]:", e);
      throw {
        title: "响应解析错误",
        message: "服务器返回的数据格式不正确",
        detail: e instanceof Error ? e.message : String(e),
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    url: string,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const config = await this.setHeaders(options);
      const baseUrl = url.startsWith("http") ? url : `http://${url}`;
      const newUrl = new URL(endpoint, baseUrl);

      const response = await fetch(newUrl, {
        ...config,
        signal: controller.signal,
        credentials: "include",
        mode: "cors",
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw {
          title: "请求超时",
          message: "服务器响应时间过长，请稍后重试",
          detail: `请求URL: ${url}${endpoint}\n超时时间: ${this.timeout}ms`,
        };
      }

      if ((error as ErrorResponse).title && (error as ErrorResponse).message) {
        throw error;
      }

      console.error("[Request Error]:", error);
      throw {
        title: "请求失败",
        message: error.message || "发生未知错误",
        detail: `请求URL: ${url}${endpoint}\n错误详情: ${error.stack || error}`,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url =
      import.meta.env.VITE_API_BASE_URL ?? DEFAULT_CONFIG.VITE_API_BASE_URL;
    return this.request<T>(endpoint, options, url);
  }

  public async dev<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const address = import.meta.env.VITE_ADDRESS ?? DEFAULT_CONFIG.VITE_ADDRESS;
    const port =
      Number(import.meta.env.VITE_PORT ?? DEFAULT_CONFIG.VITE_PORT) + 1;
    return this.request<T>(endpoint, options, `${address}:${port}`);
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
      username: import.meta.env.VITE_API_USERNAME,
      password: import.meta.env.VITE_API_PASSWORD,
    };

    return this.api<T>("/auth/token/system", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }
}
