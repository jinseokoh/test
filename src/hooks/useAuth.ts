'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// 기존 useAuth 훅과 호환성을 유지하기 위한 래퍼 훅
export function useAuth() {
  const router = useRouter()
  const { 
    user, 
    accessToken, 
    isLoading, 
    error, 
    login: storeLogin, 
    logout: storeLogout, 
    refresh, 
    checkAuth 
  } = useAuthStore()

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 기존 인터페이스와 일치하도록 래핑
  const login = async (username: string, password: string, role: string) => {
    try {
      await storeLogin(username, password, role)
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await storeLogout()
    router.push('/login')
  }

  return {
    user,
    accessToken,
    isLoading,
    error,
    login,
    logout,
    refresh
  }
}
