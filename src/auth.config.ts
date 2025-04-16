export const authConfig = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 1 Day
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
}
