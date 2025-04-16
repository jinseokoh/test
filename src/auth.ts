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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
    const res = await fetch(
      url,
      {
        method: 'POST',
        body: null,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    )


    if (!res.ok) {
      throw new Error('refreshAccessToken !!!!! failed');
    }

    const data = await res.json()
    console.log(`💋 tokens`, JSON.stringify(data))

    return {
      ...token,
      accessToken: data.accessToken,
      // asdfaarefreshToken: data.refreshToken ?? token.refreshToken,
    }
  } catch (error) {
    console.error('refreshingAccessToken:', error)
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
          const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
          const res = await fetch(
            url,
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

          const data = await res.json()
          const result = data?.result

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
            name: result.user?.name || null,
            email: result.user?.email || null,
            image: result.user?.avatar || null,
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
        const diff = token.accessTokenExpires - Date.now();
        console.log(`👅 session`, JSON.stringify(token))
        console.log(`👅 diff`, diff / 1000)
        return token
      }

      return refreshAccessToken(token)
    },
    session: async ({ session, token }) => {

      console.log(`🦊👀 session`, JSON.stringify(session))
      console.log(`🦊👀 token`, JSON.stringify(token))
      if (token) {
        session.accessToken = token.accessToken
        session.accessTokenExpires = token.accessTokenExpires
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
        console.log(`🦊 session`, JSON.stringify(session))

      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
