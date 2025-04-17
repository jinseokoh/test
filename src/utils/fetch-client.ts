// utils/fetchClient.ts

import { auth, signOut } from '@/auth'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  exp?: number
  [key: string]: unknown
}

// 전역 Promise 캐시
let refreshPromise: Promise<any> | null = null

// Helper function to extract expiration
function getTokenExpiration(token: string): number | undefined {
  try {
    const decodedToken = jwtDecode<DecodedToken>(token)
    return decodedToken?.exp ? Number(decodedToken.exp) * 1000 : undefined
  } catch (error) {
    console.error('Error decoding token:', error)
    return undefined
  }
}

// Refresh access token
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  accessTokenExpires: number | undefined
}> {
  if (refreshPromise) {
    console.log('Waiting for existing refresh promise...')
    return refreshPromise
  }

  try {
    console.log('Refreshing token with refreshToken:', refreshToken)
    refreshPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      body: null,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Refresh token request failed: ${await response.text()}`
          )
        }

        const data = await response.json()
        const result = data?.result

        if (!result?.accessToken) {
          throw new Error('No accessToken in refresh response')
        }

        const accessTokenExpires = getTokenExpiration(result.accessToken)
        console.log('Refreshed Decoded Token:', jwtDecode(result.accessToken))
        console.log(
          'Refreshed Expiration Duration (seconds):',
          accessTokenExpires ? (accessTokenExpires - Date.now()) / 1000 : 'N/A'
        )

        return {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken ?? refreshToken,
          accessTokenExpires,
        }
      })
      .finally(() => {
        refreshPromise = null
      })

    return await refreshPromise
  } catch (error) {
    console.error('RefreshAccessTokenError:', error)
    refreshPromise = null
    throw error
  }
}

export const fetchClient = async (
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> => {
  const MAX_RETRIES = 1 // 최대 재시도 횟수
  const session = await auth()

  if (!session || !session.accessToken) {
    console.log('No session or accessToken, proceeding without Authorization')
    return fetch(url, options)
  }

  console.log(`From the fetchClient ${session.accessToken}`)

  const fetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
      'Cache-Control': 'no-cache',
    },
  }

  const response = await fetch(url, fetchOptions)

  // 401 에러 처리
  if (response.status === 401 && retryCount < MAX_RETRIES) {
    console.log('401 Unauthorized, attempting to refresh token...')
    try {
      const newTokens = await refreshAccessToken(session.refreshToken)

      // 새 세션 정보로 요청 재시도
      const newFetchOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }

      console.log(`Retrying with new accessToken: ${newTokens.accessToken}`)
      return fetchClient(url, newFetchOptions, retryCount + 1)
    } catch (error) {
      console.error('Failed to refresh token:', error)
      await signOut({ redirect: false })
      throw new Error('Session expired, please log in again')
    }
  }

  return response
}
