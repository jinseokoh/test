'use server'

import { signIn, signOut } from '@/auth'
import { LoginFormData } from '@/schemas/login-schema'
import { parse } from 'cookie'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function doSocialLogin(formData: FormData) {
  const action = formData.get('action')
  await signIn(action, { redirectTo: '/' })
}

export async function doLogout() {
  await signOut({ redirectTo: '/' })
}

export async function doCredentialLogin(formData: LoginFormData) {
  try {
    const response = await signIn('credentials', {
      username: formData.username,
      password: formData.password,
      role: formData.role,
      redirect: false,
    })
    revalidatePath('/')
    return response
  } catch (err) {
    console.error('doCredentialLogin error', err)
    throw err
  }
}

export const setCookies = async (authCookies: string[] | undefined) => {
  console.log('--- Setting Cookies (Server)---')
  if (authCookies && authCookies.length > 0) {
    const cookieStore = await cookies()
    
    authCookies.forEach((cookie) => {
      const parsedCookie = parse(cookie)
      const [cookieName, cookieValue] = Object.entries(parsedCookie)[0]
      
      if (!cookieName || !cookieValue) return

      cookieStore.set(cookieName, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: parsedCookie.path || '/',
        ...(parsedCookie['Max-Age'] && { maxAge: parseInt(parsedCookie['Max-Age']) }),
        ...(parsedCookie.expires && { expires: new Date(parsedCookie.expires) })
      })
    })
  }
}
