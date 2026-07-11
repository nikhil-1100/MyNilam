import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '../types/api'

declare const process: any;

let apiBaseUrl = 'http://localhost:8000/api';

const getNextPublicApiUrl = (): string | undefined => {
  try {
    return process.env.NEXT_PUBLIC_API_URL;
  } catch {
    return undefined;
  }
};

const getExpoPublicApiUrl = (): string | undefined => {
  try {
    return process.env.EXPO_PUBLIC_API_URL;
  } catch {
    return undefined;
  }
};

apiBaseUrl = getNextPublicApiUrl() || getExpoPublicApiUrl() || 'http://localhost:8000/api/v1';

export const USE_MOCK = (() => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.NEXT_PUBLIC_USE_MOCK === 'false') return false;
      if (process.env.EXPO_PUBLIC_USE_MOCK === 'false') return false;
    }
  } catch {}
  return true; // Default to true (mock mode)
})();

export class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleError.bind(this)
    )

    this.client.interceptors.response.use(
      (response) => response,
      this.handleResponseError.bind(this)
    )
  }

  private handleRequest(config: InternalAxiosRequestConfig) {
    const token = this.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }

  private handleError(error: any) {
    return Promise.reject(error)
  }

  private async handleResponseError(error: any) {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = this.getRefreshToken()
        if (refreshToken) {
          const response = await this.client.post('/auth/refresh/', {
            refresh_token: refreshToken,
          })
          const result = response.data.data
          this.setToken(result.access_token)
          originalRequest.headers.Authorization = `Bearer ${result.access_token}`
          return this.client(originalRequest)
        }
      } catch (refreshError) {
        this.clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    const serverError = error.response?.data?.error
    const apiError: ApiError = {
      message: serverError?.message || error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      errors: serverError?.errors || error.response?.data?.errors,
    }

    return Promise.reject(apiError)
  }

  private getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  private getRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('refresh_token')
    }
    return null
  }

  private setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  private clearTokens() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().getClient()