import { prisma } from '@/lib/prisma';
import { SectionCard } from '@/components/Cards';
import { NewButton, SimpleTable } from '@/components/Tables';
import { requireTenantContext } from '@/lib/tenant';

export default async function InvoicesPage() {
  const { org } = await requireTenantContext();
  const invoices = await prisma.invoice.findMany({ where: { organizationId: org.id }, include: { clientAccount: true }, orderBy: { issueDate: 'desc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Invoices</h1><div className="muted">Deposit, balance, and standard invoices.</div></div></header>
      <SectionCard title="All invoices" action={<NewButton href="/invoices/new" label="New invoice" />}>
        <SimpleTable headers={['Invoice', 'Client', 'Type', 'Status', 'Amount due']} rows={invoices.map((invoice) => [
          invoice.invoiceNumber,
          invoice.clientAccount.displayName,
          invoice.type,
          <span className="pill" key={invoice.id}>{invoice.status}</span>,
          `£${invoice.amountDue.toFixed(2)}`
        ])} />
      </SectionCard>
    </div>
  );
}
