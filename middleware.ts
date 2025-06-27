import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow /auth/*, /security, /_next, and favicon.ico without checks
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/security') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return supabaseResponse;
  }

  // If not authenticated, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Check if password is set for the user
  const { data: passwordRows, error } = await supabase
    .from('password')
    .select('password')
    .eq('user_id', user.id)
    .limit(1);

  const passwordRow = passwordRows?.[0];

  if (
    error ||
    !passwordRow ||
    passwordRow.password === null ||
    passwordRow.password === ''
  ) {
    // No password row, or password is empty/null
    const url = request.nextUrl.clone();
    url.pathname = '/security';
    return NextResponse.redirect(url);
  }

  // All good, allow the request
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}; 