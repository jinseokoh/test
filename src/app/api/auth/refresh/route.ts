import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const refreshToken = (await cookies()).get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
    const nestResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`, // 수동으로 쿠키 전달
      },
      credentials: 'include',
    })

    const data = await nestResponse.json()

    if (!nestResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: nestResponse.status }
      )
    }

    return NextResponse.json({
      accessToken: data.accessToken,
      expiresAt: data.expiresAt,
    })
  } catch (error) {
    console.error('Error in refresh route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
