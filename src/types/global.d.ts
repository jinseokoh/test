import { DECREASE, INCREASE } from '@/constants'

export interface HttpErrorResponse {
  message: string
  statusCode: number
}

export type DateRange = {
  start: Date
  end: Date
}

export type ApiTokens = {
  accessToken: string
  expiresIn: number
}

export interface ListParams {
  [key: string]: string | number
}

export interface FilterValue {
  operator: string
  value: string | number | Array<string | number>
}

export interface Filters {
  [key: string]: string | number | FilterValue
}

// IInfiniteScroll을 Generic 인터페이스로 변경
export interface IInfiniteScroll<T> {
  links: {
    current: string
    last?: string
    next?: string
  }
  meta: {
    currentPage: number
    itemsPerPage: number
    sortBy: Array<{ field: string; direction: 'ASC' | 'DESC' }>
    totalItems: number
    totalPages: number
  }
  data: T[]
}

export interface InfiniteListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string | string[]
  filter?: Filters
}

export type S3Urls = {
  uploadUrl: string
  imageUrl: string
}

// 새로운 에러 타입 정의
export interface FetchError extends Error {
  status?: number
}

export interface ImageWithMimeType {
  url: string
  mimeType: string | null
  file: File | null
  progress: number
  uploadedUrl?: string
}

export type ChangeType = typeof INCREASE | typeof DECREASE

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void
    }
  }
}
