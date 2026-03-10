import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';

export default async function PortalClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { org } = await requireTenantContext();

  const client = await prisma.clientAccount.findFirst({
    where: { organizationId: org.id, portalToken: token },
    include: {
      events: { orderBy: { eventDate: 'asc' } },
      invoices: { orderBy: { dueDate: 'asc' } },
      contracts: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!client) notFound();

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>{client.displayName} portal</h1><div className="muted">Client-facing starter for bookings, contracts and balances.</div></div></header>
      <div className="grid cols2">
        <SectionCard title="Upcoming bookings">
          <SimpleTable headers={['Date', 'Booking', 'Status', 'Balance']} rows={client.events.map((event) => [
            new Date(event.eventDate).toLocaleDateString('en-GB'),
            event.title,
            event.status,
            `£${event.balanceDue.toFixed(2)}`
          ])} />
        </SectionCard>
        <SectionCard title="Contracts">
          <SimpleTable headers={['Contract', 'Status', 'Action']} rows={client.contracts.map((contract) => [
            contract.contractNumber,
            contract.status,
            contract.status === 'SENT' ? 'Sign online (scaffold)' : 'View'
          ])} />
        </SectionCard>
      </div>
      <SectionCard title="Invoices">
        <SimpleTable headers={['Invoice', 'Due date', 'Status', 'Amount due']} rows={client.invoices.map((invoice) => [
          invoice.invoiceNumber,
          new Date(invoice.dueDate).toLocaleDateString('en-GB'),
          invoice.status,
          `£${invoice.amountDue.toFixed(2)}`
        ])} />
      </SectionCard>
    </div>
  );
}
