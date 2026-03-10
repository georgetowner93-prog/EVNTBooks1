import { NextResponse } from 'next/server';
import { getTrueLayerAuthUrl, hasTrueLayerConfig } from '@/lib/banking/truelayer';

export async function GET() {
  if (!hasTrueLayerConfig()) {
    return NextResponse.json({ ok: false, message: 'Missing TrueLayer environment variables.' }, { status: 400 });
  }

  const url = getTrueLayerAuthUrl(crypto.randomUUID());
  return NextResponse.json({ ok: true, provider: 'truelayer', url });
}
