// types/next-auth.d.ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
      phone: string
      role: string
      username: string
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    phone: string
    role: string
    username: string
    accessToken: string
    refreshToken: string
    accessTokenExpires?: number
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    phone: string
    role?: string
    username?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    name?: string | null
    email?: string | null
    image?: string | null
    error?: string
  }
}
