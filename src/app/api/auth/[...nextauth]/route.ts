import NextAuth from 'next-auth/next';

import { Role } from '@/enums';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      //! credentials provider 에서는 signIn() 호출시마다 호출됨
      async authorize(credentials) {
        const url = `${process.env.NEXTAUTH_URL}/api/login`
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
            role: credentials?.role,
          }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // refreshToken 쿠키 수신
        })

        const data = await response.json()
        if (response.ok && data) {
          return {
            id: data.result.user.id,
            username: data.result.user.username,
            email: data.result.user.email,
            phone: data.result.user.phone,
            avatar: data.result.user.avatar,
            role: data.result.role,
            accessToken: data.result.accessToken,
            expiresAt: data.result.expiresAt,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log(`🦊 callback jwt`, token, user)
      if (user) {
        token.id = user.id as number
        token.username = user.username
        token.sub = user.id.toString()
        token.role = user.role as string
        token.accessToken = user.accessToken as string
        token.expiresAt = user.expiresAt as number
      }
      return token
    },

    //? getServerSession() 이나 getSession() 호출시 가져오는 값을 설정
    async session({ session, token }) {
      console.log(`🦊 callback session`, session, token)

      if (token) {
        // jwt payload
        session.user = {
          id: +token.id,
          username: token.username as string,
          role: token.role as Role,
        }
        session.accessToken = token.accessToken as string
        session.expiresAt = token.expiresAt as number
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST };
