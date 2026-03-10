import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';

export default async function ExpensesPage() {
  const { org } = await requireTenantContext();
  const expenses = await prisma.expense.findMany({ where: { organizationId: org.id }, orderBy: { expenseDate: 'desc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Expenses</h1><div className="muted">Stage 3A expense tracking with manual and bank-fed items.</div></div></header>
      <SectionCard title="Expense register">
        <SimpleTable headers={['Date', 'Description', 'Category', 'Source', 'Supplier', 'Allowable', 'Amount']} rows={expenses.map((expense) => [
          new Date(expense.expenseDate).toLocaleDateString('en-GB'),
          expense.description,
          expense.category,
          expense.source,
          expense.supplier ?? '—',
          expense.isAllowable ? 'Yes' : 'No',
          `£${expense.amount.toFixed(2)}`
        ])} />
      </SectionCard>
    </div>
  );
}
