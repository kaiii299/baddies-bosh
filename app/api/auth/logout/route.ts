import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  )

  // Remove the auth cookie
  response.cookies.set('session', '', {
    expires: new Date(0),
    path: '/',
  })

  return response
} 