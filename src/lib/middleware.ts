import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Allow /auth/* and /security without checks
  if (pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  if (!user) {
    // No user, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // User is logged in, now check for password row
  const { data: passwordRows, error } = await supabase
    .from('password')
    .select('password')
    .eq('user_id', user.id)
    .limit(1)

  const passwordRow = passwordRows?.[0]

  if (
    error ||
    !passwordRow ||
    passwordRow.password === null ||
    passwordRow.password === ''
  ) {
    // No password row, or password is empty/null
    const url = request.nextUrl.clone()
    url.pathname = '/security'
    return NextResponse.redirect(url)
  }

  // All good, user is authenticated and has valid password
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}