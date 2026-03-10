import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { createContract } from '@/lib/actions';

export default async function NewContractPage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } });
  const events = await prisma.event.findMany({ where: { organizationId: org.id }, orderBy: { eventDate: 'asc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>New contract</h1><div className="muted">Contract starter. Add PDF rendering and acceptance flow next.</div></div></header>
      <form action={createContract} className="card formGrid">
        <label><span>Contract number</span><input name="contractNumber" required /></label>
        <label><span>Status</span><select name="status"><option value="DRAFT">Draft</option><option value="SENT">Sent</option><option value="ACCEPTED">Accepted</option></select></label>
        <label><span>Client</span><select name="clientAccountId" required>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName}</option>)}</select></label>
        <label><span>Linked event</span><select name="eventId"><option value="">No linked event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
        <label className="full"><span>Title</span><input name="title" required /></label>
        <label className="full"><span>Body</span><textarea name="body" required defaultValue="Performance terms, cancellation policy, payment schedule, force majeure, and liability terms go here." /></label>
        <div className="full"><button type="submit">Create contract</button></div>
      </form>
    </div>
  );
}
