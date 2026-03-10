import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard, StatCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';
import { getEventProfitRows } from '@/lib/profit';

export default async function TaxPage() {
  const { org } = await requireTenantContext();

  const [period, payments, expenses, eventProfitRows] = await Promise.all([
    prisma.taxPeriod.findFirst({ where: { organizationId: org.id }, orderBy: { startsOn: 'desc' } }),
    prisma.payment.findMany({ where: { organizationId: org.id }, orderBy: { paidAt: 'desc' } }),
    prisma.expense.findMany({ where: { organizationId: org.id }, orderBy: { expenseDate: 'desc' } }),
    getEventProfitRows(),
  ]);

  const income = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const costs = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = income - costs;
  const estimatedTax = Math.max(profit * 0.2, 0);

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Self-employed tax</h1><div className="muted">Starter tax dashboard fed from bookings, expenses and event-level profitability.</div></div></header>
      <div className="grid cols4">
        <StatCard label="Tax period" value={period?.label ?? 'Current'} />
        <StatCard label="Income recorded" value={`£${income.toFixed(2)}`} />
        <StatCard label="Expenses recorded" value={`£${costs.toFixed(2)}`} />
        <StatCard label="Estimated tax reserve" value={`£${estimatedTax.toFixed(2)}`} />
      </div>
      <div className="grid cols2">
        <SectionCard title="Period summary">
          <div className="stack">
            <div className="infoRow"><span>Status</span><span className="pill">{period?.status ?? 'OPEN'}</span></div>
            <div className="infoRow"><span>Estimated profit</span><strong>{`£${profit.toFixed(2)}`}</strong></div>
            <div className="infoRow"><span>Notes</span><span className="muted small">{period?.notes ?? 'No notes yet.'}</span></div>
          </div>
        </SectionCard>
        <SectionCard title="Accountant export starter">
          <div className="stack">
            <div className="pill">CSV export scaffold</div>
            <div className="pill">Quarterly summary scaffold</div>
            <div className="pill">Year-end adjustments scaffold</div>
            <p className="muted small">Direct HMRC filing is not wired yet in this build.</p>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Profit per event">
        <SimpleTable headers={['Event', 'Client', 'Revenue', 'Direct costs', 'Profit', 'Margin']} rows={eventProfitRows.map((event) => [
          event.title,
          event.client,
          `£${event.revenueBase.toFixed(2)}`,
          `£${event.costBase.toFixed(2)}`,
          `£${event.profit.toFixed(2)}`,
          `${event.margin.toFixed(1)}%`
        ])} />
      </SectionCard>
      <SectionCard title="Expense detail">
        <SimpleTable headers={['Date', 'Description', 'Category', 'Source', 'Amount']} rows={expenses.map((expense) => [
          new Date(expense.expenseDate).toLocaleDateString('en-GB'),
          expense.description,
          expense.category,
          expense.source,
          `£${expense.amount.toFixed(2)}`
        ])} />
      </SectionCard>
    </div>
  );
}
