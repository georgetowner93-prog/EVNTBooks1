import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    mode: 'scaffold',
    message: 'Reminder scaffold only. Add Twilio credentials and scheduling to send real SMS or email payout reminders.'
  });
}
