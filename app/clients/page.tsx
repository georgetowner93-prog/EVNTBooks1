import { prisma } from '@/lib/prisma';
import { SectionCard } from '@/components/Cards';
import { NewButton, SimpleTable } from '@/components/Tables';
import { requireTenantContext } from '@/lib/tenant';

export default async function ClientsPage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Clients</h1><div className="muted">People and companies you book for.</div></div></header>
      <SectionCard title="All clients" action={<NewButton href="/clients/new" label="New client" />}>
        <SimpleTable
          headers={['Name', 'Type', 'Email', 'Phone']}
          rows={clients.map((client) => [client.displayName, client.type, client.billingEmail ?? '—', client.billingPhone ?? '—'])}
        />
      </SectionCard>
    </div>
  );
}
