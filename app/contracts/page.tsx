import { prisma } from '@/lib/prisma';
import { SectionCard } from '@/components/Cards';
import { NewButton, SimpleTable } from '@/components/Tables';
import { requireTenantContext } from '@/lib/tenant';

export default async function ContractsPage() {
  const { org } = await requireTenantContext();
  const contracts = await prisma.contract.findMany({ where: { organizationId: org.id }, include: { clientAccount: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Contracts</h1><div className="muted">Starter contract records and reusable body content.</div></div></header>
      <SectionCard title="All contracts" action={<NewButton href="/contracts/new" label="New contract" />}>
        <SimpleTable headers={['Contract', 'Client', 'Status', 'Title']} rows={contracts.map((contract) => [
          contract.contractNumber,
          contract.clientAccount.displayName,
          <span className="pill" key={contract.id}>{contract.status}</span>,
          contract.title
        ])} />
      </SectionCard>
    </div>
  );
}
