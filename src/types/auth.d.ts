export interface User {
  id: string
  email: string | null
  username: string
  avatar: string | null
  createdAt: Date
}

export interface Session {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}
