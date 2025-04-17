import { auth } from '@/auth'

export const fetchClient = async (url: string, options?: RequestInit) => {
  const session = await auth()
  if (!session) return fetch(url, options)
  
  console.log(`From the fetchClient ${JSON.stringify(session.accessToken)}`)

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...(session && { Authorization: `Bearer ${session.accessToken}` }),
    },
  })
}
