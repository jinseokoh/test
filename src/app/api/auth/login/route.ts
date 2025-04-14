// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
    const nestResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // NestJS에서 쿠키 주면 받아오기 위한 설정 (필수 아님)
      credentials: 'include',
    })

    const responseBody = await nestResponse.json()

    const response = NextResponse.json(responseBody, {
      status: nestResponse.status,
    })

    // Try alternative method to get cookies
    const setCookieHeader = nestResponse.headers.get('set-cookie')
    if (setCookieHeader) {
      // Split cookies if multiple are in a single header
      const cookies = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9\-_]+=)/)
      cookies.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie.trim())
      })
    }

    return response
  } catch (error) {
    console.error('Error in login route:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
