import { getEventProfitRows } from '@/lib/profit';
import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';

function startOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardData() {
  const { org } = await requireTenantContext();

  const monthStart = startOfMonth();

  const [
    enquiryCount,
    eventCount,
    invoiceCount,
    quoteCount,
    contractCount,
    unpaidInvoices,
    upcomingEvents,
    recentEnquiries,
    recentExpenses,
    emailTemplates,
    automationRules,
    bookingForms,
    formSubmissions,
    bankAccounts,
    recentTransactions,
    availabilityBlocks,
    taxPeriod,
    upcomingPerformerPayouts,
  ] = await Promise.all([
    prisma.enquiry.count({ where: { organizationId: org.id } }),
    prisma.event.count({ where: { organizationId: org.id } }),
    prisma.invoice.count({ where: { organizationId: org.id } }),
    prisma.quote.count({ where: { organizationId: org.id } }),
    prisma.contract.count({ where: { organizationId: org.id } }),
    prisma.invoice.findMany({
      where: { organizationId: org.id, amountDue: { gt: 0 } },
      include: { clientAccount: true },
      orderBy: { dueDate: 'asc' },
      take: 5
    }),
    prisma.event.findMany({
      where: { organizationId: org.id },
      include: { clientAccount: true },
      orderBy: { eventDate: 'asc' },
      take: 6
    }),
    prisma.enquiry.findMany({
      where: { organizationId: org.id },
      include: { clientAccount: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.expense.findMany({
      where: { organizationId: org.id },
      orderBy: { expenseDate: 'desc' },
      take: 5
    }),
    prisma.emailTemplate.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.automationRule.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.bookingForm.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.bookingFormSubmission.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.bankAccountConnection.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' }, take: 2 }),
    prisma.bankTransaction.findMany({ where: { organizationId: org.id }, orderBy: { postedAt: 'desc' }, take: 6 }),
    prisma.availabilityBlock.findMany({ where: { organizationId: org.id }, orderBy: { startsAt: 'asc' }, take: 5 }),
    prisma.taxPeriod.findFirst({ where: { organizationId: org.id }, orderBy: { startsOn: 'desc' } }),
    prisma.eventPerformerAssignment.findMany({ where: { organizationId: org.id }, include: { performer: true, event: true }, orderBy: { payoutDueDate: 'asc' }, take: 5 }),
  ]);

  const [revenue, monthlyExpenses, totalExpenses, allPayments, profitableEvents] = await Promise.all([
    prisma.payment.aggregate({ where: { organizationId: org.id, paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { organizationId: org.id, expenseDate: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { organizationId: org.id }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { organizationId: org.id }, _sum: { amount: true } }),
    getEventProfitRows(),
  ]);

  const monthRevenue = revenue._sum.amount ?? 0;
  const monthExpensesTotal = monthlyExpenses._sum.amount ?? 0;
  const totalExpensesAmount = totalExpenses._sum.amount ?? 0;
  const lifetimeRevenue = allPayments._sum.amount ?? 0;
  const estimatedProfit = lifetimeRevenue - totalExpensesAmount;
  const taxSetAside = Math.max(estimatedProfit * 0.2, 0);

  return {
    org,
    stats: {
      enquiryCount,
      eventCount,
      invoiceCount,
      quoteCount,
      contractCount,
      monthRevenue,
      monthExpensesTotal,
      estimatedProfit,
      taxSetAside,
    },
    unpaidInvoices,
    upcomingEvents,
    recentEnquiries,
    recentExpenses,
    emailTemplates,
    automationRules,
    bookingForms,
    formSubmissions,
    bankAccounts,
    recentTransactions,
    availabilityBlocks,
    taxPeriod,
    profitableEvents: profitableEvents.sort((a, b) => b.profit - a.profit).slice(0, 5),
    upcomingPerformerPayouts,
  };
}
