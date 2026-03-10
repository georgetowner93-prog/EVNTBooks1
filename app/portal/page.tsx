import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';

export default async function PortalIndexPage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Client portal</h1><div className="muted">Starter preview links for client-facing booking, invoice and contract pages.</div></div></header>
      <SectionCard title="Portal demo links">
        <SimpleTable
          headers={['Client', 'Portal token', 'Preview']}
          rows={clients.map((client) => [
            client.displayName,
            client.portalToken ?? '—',
            client.portalToken ? <Link href={`/portal/${client.portalToken}`} key={client.id} className="button ghost">Open portal</Link> : '—'
          ])}
        />
      </SectionCard>
    </div>
  );
}
