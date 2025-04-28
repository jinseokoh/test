'use server';

import { Session } from '@/types/auth';
import { cookies } from 'next/headers';

/**
 * JWT 토큰의 유효성을 검사하는 함수
 * @param token JWT 토큰
 * @returns 토큰이 유효한지 여부
 */
function _isTokenValid(token: string): boolean {
  try {
    // Base64 디코딩하여 JWT의 payload 부분 추출
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    
    // exp 필드 확인 (만료 시간, UNIX 타임스탬프)
    if (decodedPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedPayload.exp > currentTime;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * 세션 검증 및 갱신
 * 유효한 세션 정보를 반환하거나 세션이 없는 경우 null 값을 포함한 객체 반환
 */
export async function verifySession(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    const accessToken = cookieStore.get('accessToken')?.value;
    
    // 1. accessToken이 있고 유효하면 사용자 정보 조회
    if (accessToken && _isTokenValid(accessToken)) {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/mine`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (userResponse.ok) {
          const user = await userResponse.json();
          return {
            accessToken,
            refreshToken: refreshToken || null,
            user,
          };
        }
      } catch {
        // 에러 발생 시 토큰 갱신 시도
      }
    }
    
    // 2. accessToken이 없거나 만료되었으면 refreshToken으로 갱신 시도
    if (!refreshToken) {
      return { accessToken: null, refreshToken: null, user: null };
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return { accessToken: null, refreshToken: null, user: null };
    }

    const tokenData = await response.json();
    const newAccessToken = tokenData.result.accessToken;
    
    if (!newAccessToken) {
      return { accessToken: null, refreshToken: null, user: null };
    }

    // 새 accessToken으로 사용자 정보 요청
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/mine`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newAccessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!userResponse.ok) {
      return { accessToken: newAccessToken, refreshToken, user: null };
    }

    const user = await userResponse.json();

    return {
      accessToken: newAccessToken,
      refreshToken,
      user,
    };
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
}

/**
 * 로그아웃 처리
 * 토큰 무효화 및 쿠키 삭제
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  try {
    const accessToken = cookieStore.get('accessToken')?.value

    // 서버에 로그아웃 요청 (토큰 무효화)
    if (accessToken) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });
    }

    // 쿠키 삭제
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
  }
} 