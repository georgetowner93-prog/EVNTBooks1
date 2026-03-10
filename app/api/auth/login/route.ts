import { NextResponse } from 'next/server';
import { attemptLogin } from '@/lib/auth/login';
import { createSessionCookie } from '@/lib/auth/session';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const code = String(formData.get('code') || '');
  const next = String(formData.get('next') || '/');

  const result = await attemptLogin(email, password, code);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.message)}&next=${encodeURIComponent(next)}`, request.url));
  }

  await createSessionCookie(result.user);
  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', request.url));
}
