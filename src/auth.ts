// app/auth.ts

import { jwtDecode } from 'jwt-decode'
import type { User } from 'next-auth'
import NextAuth from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'

interface DecodedToken {
  exp?: number
  [key: string]: unknown
}

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

// async function refreshAccessToken(token: JWT): Promise<JWT> {
//   try {
//     console.log('🟠 Refreshing token with refreshToken:', token.refreshToken)
//     const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`
//     const res = await fetch(url, {
//       method: 'POST',
//       body: null,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token.refreshToken}`,
//       },
//     })
//     if (!res.ok) {
//       throw new Error('refresh API failed')
//     }
//     const data = await res.json()
//     const result = data?.result;

//     const accessTokenExpires = getTokenExpiration(result.accessToken)

//     return {
//       ...token,
//       accessToken: result.accessToken,
//       refreshToken: result.refreshToken ?? token.refreshToken,
//       accessTokenExpires,
//       error: undefined,
//     }
//   } catch (error) {
//     console.error('RefreshAccessTokenError:', error)
//     return {
//       ...token,
//       error: 'RefreshAccessTokenError',
//     }
//   }
// }

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      credentials: {
        username: {},
        password: {},
        role: {},
      },
      async authorize(credentials): Promise<User | null> {
        if (
          !credentials ||
          typeof credentials.username !== 'string' ||
          typeof credentials.password !== 'string' ||
          typeof credentials.role !== 'string'
        ) {
          return null
        }

        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
          const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
              role: credentials.role,
            }),
            headers: { 'Content-Type': 'application/json' },
          })

          if (!res.ok) {
            console.error('Login failed:', await res.json())
            return null
          }

          const data = await res.json()
          const result = data?.result

          if (!result?.accessToken) {
            console.error('No accessToken in response')
            return null
          }

          console.log(
            `💋 AccessToken: ${result.accessToken}, RefreshToken: ${result.refreshToken}`
          )
          // Parse the expiration time from the token
          const accessTokenExpires = getTokenExpiration(result.accessToken)

          const user: User = {
            id: String(result?.user?.id),
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            role: result.role || credentials.role,
            username: result.username || credentials.username,
            accessTokenExpires,
            phone: result.user?.phone || '',
            name: result.user?.name || null,
            email: result.user?.email || null,
            image: result.user?.avatar || null,
          }

          return user
        } catch (e) {
          console.error('Authorize error:', e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      console.log(`🟢 NextAuth jwt 콜백 - token: ${JSON.stringify(token)}`)

      // 사용자의 첫 로그인
      if (user) {
        console.log(`🟢 NextAuth jwt 콜백 - user: ${JSON.stringify(user)}`)

        const updatedToken = {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          id: user.id,
          name: user.username,
          username: user.username,
          phone: user.phone,
          image: user.image,
          accessTokenExpires: user.accessTokenExpires,
        } as JWT
        console.log(
          `🟢 NextAuth jwt 콜백 - returns ${JSON.stringify(updatedToken)}`
        )
        return updatedToken
      }

      // Return existing token (refresh is handled in fetchClient)
      console.log(`🟢 기존 token 또는 fetchClient 가 갱신한 token`, token)
      return token;
    },
    session: async ({ session, token }) => {
      console.log(`🟡 NextAuth session 콜백 - session:`, JSON.stringify(session))
      console.log(`🟡 NextAuth session 콜백 - token:`, JSON.stringify(token))
      if (token) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.accessTokenExpires = token.accessTokenExpires
        session.error = token.error
        session.user = {
          id: token.id,
          phone: token.phone,
          role: token.role ?? '',
          username: token.username ?? '',
          name: token.name ?? null,
          image: token.image ?? null,
          email: token.email ?? '', // 👈 추가 (없으면 오류 발생해서)
          emailVerified: null, // 👈 추가
          accessToken: token.accessToken ?? '', // 👈 추가
          refreshToken: token.refreshToken ?? '', // 👈 추가
        }
      }
        console.log(
          `🟡 NextAuth session 콜백 - 최종 session:`,
          JSON.stringify(session)
        )
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
