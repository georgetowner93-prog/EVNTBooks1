import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { createQuote } from '@/lib/actions';

export default async function NewQuotePage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } });
  const events = await prisma.event.findMany({ where: { organizationId: org.id }, orderBy: { eventDate: 'asc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>New quote</h1><div className="muted">A practical quote starter, ready for richer line items later.</div></div></header>
      <form action={createQuote} className="card formGrid">
        <label><span>Quote number</span><input name="quoteNumber" required /></label>
        <label><span>Status</span><select name="status"><option value="DRAFT">Draft</option><option value="SENT">Sent</option><option value="ACCEPTED">Accepted</option></select></label>
        <label><span>Client</span><select name="clientAccountId" required>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName}</option>)}</select></label>
        <label><span>Linked event</span><select name="eventId"><option value="">No linked event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
        <label><span>Valid until</span><input type="date" name="validUntil" /></label>
        <label><span>Total</span><input type="number" name="total" min="0" step="0.01" required /></label>
        <label className="full"><span>Notes</span><textarea name="notes" /></label>
        <div className="full"><button type="submit">Create quote</button></div>
      </form>
    </div>
  );
}
