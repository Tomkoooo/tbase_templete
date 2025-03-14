// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ha az auth oldalon vagyunk, folytassuk
  if (pathname === '/-tbase/auth') {
    return NextResponse.next();
  }

  // Token ellenőrzés (ez nem igényel crypto-t)
  const token = request.cookies.get('t_auth_super')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/-tbase/auth', request.url));
  }

  if(!process.env.NEXT_PUBLIC_DATABASE_CHOICE) {
    throw new Error('Please set the database choice in the .env file');
  }

  // Ha van token, továbbengedjük a layout-hoz
  return NextResponse.next();
}

export const config = {
    matcher: [
        '/-tbase',
        '/-tbase/((?!auth).*)',
      ],
};