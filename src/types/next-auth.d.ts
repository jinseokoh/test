import 'next-auth'

declare module 'next-auth' {
  interface User extends Omit<DefaultUser, 'id' | 'name' | 'image'> {
    id: number
    username: string
    email: string | null
    phone: string | null
    avatar: string | null
    role?: string // 추가
    accessToken?: string // 추가
    expiresAt?: number // 추가
  }

  // getServerSession() 이나 getSession() 호출시 가져오는 payload 형식
  interface Session {
    user: {
      id: number
      username: string
      role: string // role은 세션의 유저 정보에는 포함해야함
    }
    accessToken: string
    expiresAt: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    sub: string
    username: string
    role: string // role은 페이로드 최상위에 있음
    accessToken: string
    expiresAt: number
  }
}
