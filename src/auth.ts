// app/api/auth/[...nextauth]/auth.ts
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

/**
 * Takes a token and returns a new token with updated `accessToken` and `accessTokenExpires`.
 * If an error occurs, returns the old token with an error property.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    )

    const tokens = await response.json()

    if (!response.ok) {
      throw tokens
    }

    const accessTokenExpires = tokens.accessToken
      ? getTokenExpiration(tokens.accessToken)
      : undefined

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? token.refreshToken,
      accessTokenExpires,
      error: undefined,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

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
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                role: credentials.role,
              }),
              headers: { 'Content-Type': 'application/json' },
            }
          )

          if (!res.ok) {
            return null
          }

          const parsedResponse = await res.json()
          const result = parsedResponse?.result

          if (!result?.accessToken) {
            return null
          }

          // Parse the expiration time from the token
          const accessTokenExpires = getTokenExpiration(result.accessToken)

          const user: User = {
            id: String(result?.user?.id), // Ensure id is a number
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            role: result.role || credentials.role,
            username: result.username || credentials.username,
            phone: result.user?.phone || '',
            accessTokenExpires,
            name: result.user?.name || null, // Include required NextAuthUser fields
            email: result.user?.email || null,
            image: result.user?.image || null,
          }

          return user
        } catch (e) {
          console.error(e)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          id: user.id,
          username: user.username,
          phone: user.phone,
          accessTokenExpires: user.accessTokenExpires,
          name: user.name,
          image: user.image,
        } as JWT
      }

      if (
        token.accessTokenExpires &&
        Date.now() < Number(token.accessTokenExpires)
      ) {
        return token
      }

      return refreshAccessToken(token)
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken
      session.error = token.error
      session.user = {
        id: token.id,
        phone: token.phone,
        role: token.role ?? '',
        username: token.username ?? '',
        name: token.name ?? null,
        image: token.image ?? null,
        email: token.email ?? '', // 👈 추가
        emailVerified: null, // 👈 추가
        accessToken: token.accessToken ?? '', // 👈 추가
        refreshToken: token.refreshToken ?? '', // 👈 추가
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
