import { prisma } from '@/lib/prisma';
import { SectionCard } from '@/components/Cards';
import { NewButton, SimpleTable } from '@/components/Tables';
import { requireTenantContext } from '@/lib/tenant';

export default async function EnquiriesPage() {
  const { org } = await requireTenantContext();
  const enquiries = await prisma.enquiry.findMany({ where: { organizationId: org.id }, include: { clientAccount: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Enquiries</h1><div className="muted">Track leads from form to booking.</div></div></header>
      <SectionCard title="All enquiries" action={<NewButton href="/enquiries/new" label="New enquiry" />}>
        <SimpleTable
          headers={['Client', 'Type', 'Date', 'Status', 'Budget']}
          rows={enquiries.map((enquiry) => [
            enquiry.clientAccount?.displayName ?? 'Unlinked',
            enquiry.eventType ?? '—',
            enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString('en-GB') : '—',
            <span className="pill" key={enquiry.id}>{enquiry.status}</span>,
            enquiry.budgetMax ? `£${enquiry.budgetMax.toFixed(2)}` : '—'
          ])}
        />
      </SectionCard>
    </div>
  );
}
