import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';

export default async function BookingFormPage() {
  const { org } = await requireTenantContext();
  const [forms, submissions] = await Promise.all([
    prisma.bookingForm.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } }),
    prisma.bookingFormSubmission.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Booking form widget</h1><div className="muted">Embeddable public enquiry form starter.</div></div></header>
      {forms.map((form) => (
        <SectionCard key={form.id} title={form.name}>
          <div className="snippet">
            <div className="muted small">Embed snippet</div>
            <code>{`<iframe src="https://your-domain.com/forms/${form.slug}" width="100%" height="760"></iframe>`}</code>
          </div>
        </SectionCard>
      ))}
      <SectionCard title="Recent submissions">
        <SimpleTable headers={['Date', 'Name', 'Email', 'Event type', 'Message']} rows={submissions.map((submission) => [
          new Date(submission.createdAt).toLocaleDateString('en-GB'),
          submission.contactName,
          submission.email,
          submission.eventType ?? '—',
          submission.message ?? '—'
        ])} />
      </SectionCard>
    </div>
  );
}
