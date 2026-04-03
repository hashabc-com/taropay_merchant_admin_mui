import type {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import axios from 'axios';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

export interface ResponseData<T = any> {
  code: number | string;
  message: string;
  data?: T;
  result?: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean;
  autoAddCountry?: boolean;
  autoAddMerchantId?: boolean;
}

// ----------------------------------------------------------------------

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 60000,
    });

    this.setupInterceptors();
  }

  // --------------- helpers ---------------

  private addParam(config: InternalAxiosRequestConfig, key: string, value: string | number): void {
    if (config.method?.toUpperCase() === 'GET') {
      config.params = { ...config.params, [key]: value };
    } else if (config.data instanceof FormData) {
      config.data.append(key, String(value));
    } else {
      config.data = { ...config.data, [key]: value };
    }
  }

  // --------------- interceptors ---------------

  private setupInterceptors() {
    // Request
    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('_token');
      if (token) {
        config.headers.Token = token;
      }

      const isLoginPage = window.location.pathname.includes('/sign-in');
      const rc = config as RequestConfig;

      if (!isLoginPage) {
        // auto inject country
        if (rc.autoAddCountry !== false) {
          try {
            const raw = localStorage.getItem('country-storage');
            if (raw) {
              const { state } = JSON.parse(raw);
              if (state?.selectedCountry?.code) {
                this.addParam(config, 'country', state.selectedCountry.code);
              }
            }
          } catch {
            /* noop */
          }
        }

        // auto inject merchantId
        if (rc.autoAddMerchantId !== false) {
          try {
            const raw = localStorage.getItem('merchant-storage');
            if (raw) {
              const { state } = JSON.parse(raw);
              if (state?.selectedMerchant?.appid) {
                this.addParam(config, 'merchantId', state.selectedMerchant.appid);
              }
            }
          } catch {
            /* noop */
          }
        }
      }

      return config;
    });

    // Response
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;

        if (data.code == 201) {
          toast.error(data.message);
        }

        if (data.code == 401) {
          // Lazy import to avoid circular dependency
          localStorage.removeItem('_token');
          localStorage.removeItem('_userInfo');
          localStorage.removeItem('_permissions');
          const redirect = window.location.pathname;
          if (!redirect.startsWith('/auth')) {
            window.location.href = `/auth/jwt/sign-in?returnTo=${encodeURIComponent(redirect)}`;
          }
        }

        if (response.status === 403) {
          window.location.reload();
        }

        return response;
      },
      (error: any) => {
        const config = error.config as RequestConfig | undefined;
        if (config?.showError !== false) {
          const msg =
            error.response?.data?.message ||
            error.response?.statusText ||
            error.message ||
            'Network error';
          toast.error(msg);
        }
        return Promise.reject(error);
      }
    );
  }

  // --------------- public methods ---------------

  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    const res = await this.instance.request<ResponseData<T>>(config);
    return res.data;
  }

  async get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    if (config?.responseType === 'blob') {
      const res = await this.instance.request({ method: 'GET', url, params, ...config });
      return res.data as unknown as ResponseData<T>;
    }
    return this.request<T>({ method: 'GET', url, params, ...config });
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }
}

// Singleton
const http = new HttpClient();

export default http;
