import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';

export function formatMoney(value: number) {
  return `£${value.toFixed(2)}`;
}

export async function getEventProfitRows() {
  const { org } = await requireTenantContext();

  const events = await prisma.event.findMany({
    where: { organizationId: org.id },
    include: {
      clientAccount: true,
      expenses: true,
      payments: true,
      bankTransactions: true,
      performerAssignments: true,
    },
    orderBy: { eventDate: 'asc' }
  });

  return events.map((event) => {
    const directExpenseCosts = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const performerCosts = event.performerAssignments.reduce((sum, assignment) => sum + assignment.fee + assignment.travelFee, 0);
    const collected = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const matchedIncome = event.bankTransactions.filter((tx) => tx.direction === 'MONEY_IN').reduce((sum, tx) => sum + tx.amount, 0);
    const matchedSpend = event.bankTransactions.filter((tx) => tx.direction === 'MONEY_OUT').reduce((sum, tx) => sum + tx.amount, 0);
    const revenueBase = Math.max(event.totalPrice, collected, matchedIncome);
    const costBase = Math.max(directExpenseCosts + performerCosts, matchedSpend);
    const profit = revenueBase - costBase;
    const margin = revenueBase > 0 ? (profit / revenueBase) * 100 : 0;

    return {
      id: event.id,
      date: event.eventDate,
      title: event.title,
      client: event.clientAccount.displayName,
      status: event.status,
      revenueBase,
      costBase,
      profit,
      margin,
      performerCosts,
      notes: event.bankTransactions.map((tx) => tx.bookingMatchNote).filter(Boolean).join(' · '),
    };
  });
}
