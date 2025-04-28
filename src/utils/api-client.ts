// lib/api-client.ts
import { useSession } from '@/providers/session-provider';

interface QueueItem {
  resolve: () => Promise<void>;
  reject: (error: unknown) => void;
}

// 요청 큐 (토큰 갱신 중에 발생한 요청을 저장)
let isRefreshing = false
let failedRequestsQueue: QueueItem[] = []

// React Hook은 컴포넌트나 커스텀 훅 내부에서만 사용해야 함
export const useApiClient = () => {
  const { refreshSession } = useSession()

  const apiClient = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, options)

      // 토큰이 유효한 경우
      if (response.status !== 401) {
        return response
      }

      // 401 오류 발생: 토큰 갱신 필요
      if (!isRefreshing) {
        isRefreshing = true

        try {
          // 토큰 갱신
          await refreshSession()

          // 큐에 있는 실패한 요청들 재시도
          failedRequestsQueue.forEach((request) => request.resolve())
          failedRequestsQueue = []
        } catch (error) {
          failedRequestsQueue.forEach((request) => request.reject(error))
          failedRequestsQueue = []
          throw error
        } finally {
          isRefreshing = false
        }
      }

      // 원래 요청 재시도
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          resolve: async () => {
            try {
              const newResponse = await fetch(url, options)
              resolve(newResponse)
            } catch (error) {
              reject(error)
            }
          },
          reject: (error: unknown) => {
            reject(error)
          },
        })
      })
    } catch (error) {
      throw error
    }
  }

  return apiClient
}
