import { ApiTokens } from '@/types/global'
import { signOut } from 'next-auth/react'

export interface IHttpClient {
  setAccessToken: (token: string) => void
  setRefreshToken: (token: string) => void
  getAccessToken: () => string | undefined
  getRefreshToken: () => string | undefined
  fetch: <T = any>(url: string, options?: RequestInit) => Promise<T>
}

const baseURL = process.env.NEXT_PUBLIC_API_URL

export class HttpClient implements IHttpClient {
  private accessToken?: string
  private refreshToken?: string

  setAccessToken(token: string) {
    this.accessToken = token
  }

  setRefreshToken(token: string) {
    this.refreshToken = token
  }

  getAccessToken() {
    return this.accessToken
  }

  getRefreshToken() {
    return this.refreshToken
  }

  async fetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`
    const headers = new Headers(options.headers || {})

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }

    headers.set('Content-Type', 'application/json')
    headers.set('Access-Control-Allow-Origin', '*')

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(fullUrl, config)

      if (!response.ok) {
        if (response.status === 401) {
          return this._handleUnauthorized<T>(url, options)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return (await response.json()) as T
    } catch (error) {
      throw error
    }
  }

  private async _handleUnauthorized<T>(
    url: string,
    options: RequestInit
  ): Promise<T> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const refreshResponse = await fetch(`${baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.refreshToken}`,
        },
      })

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token')
      }

      const { accessToken } = (await refreshResponse.json()) as ApiTokens
      this.setAccessToken(accessToken)

      // Retry the original request with the new token
      return this.fetch<T>(url, options)
    } catch (refreshError) {
      console.log('⛔⛔⛔⛔', `token refresh failed`, refreshError)
      await signOut({ redirect: false })
      throw refreshError
    }
  }
}

export const clientHttpClient = new HttpClient()
