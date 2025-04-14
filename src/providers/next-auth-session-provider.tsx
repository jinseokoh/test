'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children?: ReactNode
  session: Session | null
}

const NextAuthSessionProvider = ({ children, session }: Props): ReactNode =>
  <SessionProvider session={session}>{children}</SessionProvider>

export default NextAuthSessionProvider
