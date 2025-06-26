import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow /auth/* and /security without checks
  if (pathname.startsWith('/auth') || pathname.startsWith('/security')) {
    return NextResponse.next();
  }

  // Create Supabase client (await, no args)
  const supabase = await createClient();

  // Get the user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in, redirect to /security
    return NextResponse.redirect(new URL('/security', request.url));
  }

  // Check for password row
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
    return NextResponse.redirect(new URL('/security', request.url));
  }

  // All good, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!auth|security).*)'],
}; 