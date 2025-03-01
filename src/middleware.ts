import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // // Get the token from cookies - make sure this matches your auth cookie name
  // const token = request.cookies.get('session')?.value // or 'token' depending on your cookie name
  
  // const path = request.nextUrl.pathname
  
  // // Define public routes that don't require authentication
  // const publicRoutes = ['/login', '/register']
  // const isPublicRoute = publicRoutes.includes(path)

  // // If no token and trying to access any route except public routes, redirect to login
  // if (!token && !isPublicRoute) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // // If has token and trying to access login/register, redirect to dashboard
  // if (token && isPublicRoute) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next()
}

// Configure which routes the middleware should run on - catch all routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}