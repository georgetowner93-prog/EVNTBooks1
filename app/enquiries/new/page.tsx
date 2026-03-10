import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { createEnquiry } from '@/lib/actions';

export default async function NewEnquiryPage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>New enquiry</h1><div className="muted">Capture a fresh lead.</div></div></header>
      <form action={createEnquiry} className="card formGrid">
        <label><span>Client</span><select name="clientAccountId"><option value="">Unlinked</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName}</option>)}</select></label>
        <label><span>Source</span><select name="source"><option value="MANUAL">Manual</option><option value="WEBSITE">Website</option><option value="PHONE">Phone</option><option value="EMAIL">Email</option><option value="REFERRAL">Referral</option></select></label>
        <label><span>Status</span><select name="status"><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="QUOTED">Quoted</option><option value="PENDING">Pending</option></select></label>
        <label><span>Event type</span><input name="eventType" /></label>
        <label><span>Event date</span><input type="date" name="eventDate" /></label>
        <label><span>Guest count</span><input type="number" name="guestCount" min="0" /></label>
        <label><span>Max budget</span><input type="number" name="budgetMax" min="0" step="0.01" /></label>
        <label className="full"><span>Message</span><textarea name="message" /></label>
        <div className="full"><button type="submit">Create enquiry</button></div>
      </form>
    </div>
  );
}
