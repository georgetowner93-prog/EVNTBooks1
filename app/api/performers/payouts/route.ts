import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    mode: 'scaffold',
    message: 'Payout preparation scaffold only. Wire this to your regulated Open Banking payment-initiation provider before using it for real payments.'
  });
}
