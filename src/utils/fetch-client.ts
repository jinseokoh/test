// lib/fetchClient.ts
import { auth } from '@/auth';
import { signOut as clientSignOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchClient(
  url: string,
  options: RequestInit = {},
  session?: { accessToken?: string; refreshToken?: string } | null
): Promise<Response> {
  // 서버 환경에서 세션 얻기
  const currentSession =
    session || (typeof window === 'undefined' ? await auth() : null)

  // accessToken이 없으면 그냥 요청
  if (!currentSession?.accessToken) {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Cache-Control': 'no-cache',
      },
    })
  }

  const makeAuthorizedRequest = (accessToken: string) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
    })
  }

  let response = await makeAuthorizedRequest(currentSession.accessToken)

  // 토큰 만료된 경우
  if (response.status === 401 && currentSession.refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentSession.refreshToken}`,
        },
      })

      if (!refreshResponse.ok) throw new Error('Failed to refresh token')
      const refreshData = await refreshResponse.json()
      const newAccessToken = refreshData?.result?.accessToken

      if (!newAccessToken) throw new Error('No access token received')

      // 새로운 토큰으로 다시 요청
      response = await makeAuthorizedRequest(newAccessToken)
    } catch (error) {
      if (typeof window !== 'undefined') {
        await clientSignOut({ redirect: true, callbackUrl: '/login' })
      }
      throw new Error('세션이 만료되었습니다. 다시 로그인 해주세요.')
    }
  }

  return response
}
