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

  await createSessionCookie({
  sub: result.user.id,
  orgId: result.user.orgId,
  role: result.user.role,
  email: result.user.email,
  name: result.user.name,
  isPlatformAdmin: result.user.isPlatformAdmin,
});
  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', request.url));
}
