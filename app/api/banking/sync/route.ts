import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';

export async function POST() {
  const { org } = await requireTenantContext();

  const transactions = await prisma.bankTransaction.findMany({
    where: { organizationId: org.id, eventId: null },
    include: { bankAccount: true },
    orderBy: { postedAt: 'desc' },
    take: 20,
  });
  const events = await prisma.event.findMany({ where: { organizationId: org.id }, include: { clientAccount: true } });

  let matched = 0;

  for (const tx of transactions) {
    const text = `${tx.description} ${tx.counterpartyName ?? ''} ${tx.merchantName ?? ''}`.toLowerCase();
    const event = events.find((item) =>
      text.includes(item.clientAccount.displayName.toLowerCase()) || text.includes(item.title.toLowerCase().split(' ')[0])
    );

    if (!event) continue;

    await prisma.bankTransaction.update({
      where: { id: tx.id },
      data: {
        eventId: event.id,
        bookingMatchNote: `Auto-matched to ${event.title}`,
        matchConfidence: 0.82,
        reviewStatus: 'auto_matched',
      }
    });
    matched += 1;
  }

  return NextResponse.json({ ok: true, matched });
}
