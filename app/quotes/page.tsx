import { prisma } from '@/lib/prisma';
import { SectionCard } from '@/components/Cards';
import { NewButton, SimpleTable } from '@/components/Tables';
import { requireTenantContext } from '@/lib/tenant';

export default async function QuotesPage() {
  const { org } = await requireTenantContext();
  const quotes = await prisma.quote.findMany({ where: { organizationId: org.id }, include: { clientAccount: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Quotes</h1><div className="muted">Step 2 quote builder starter.</div></div></header>
      <SectionCard title="All quotes" action={<NewButton href="/quotes/new" label="New quote" />}>
        <SimpleTable headers={['Quote', 'Client', 'Status', 'Valid until', 'Total']} rows={quotes.map((quote) => [
          quote.quoteNumber,
          quote.clientAccount.displayName,
          <span className="pill" key={quote.id}>{quote.status}</span>,
          quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-GB') : '—',
          `£${quote.total.toFixed(2)}`
        ])} />
      </SectionCard>
    </div>
  );
}
