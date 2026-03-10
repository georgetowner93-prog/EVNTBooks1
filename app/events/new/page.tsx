import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { createEvent } from '@/lib/actions';

export default async function NewEventPage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>New event</h1><div className="muted">Create a booking record.</div></div></header>
      <form action={createEvent} className="card formGrid">
        <label><span>Client</span><select name="clientAccountId" required>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName}</option>)}</select></label>
        <label><span>Status</span><select name="status"><option value="TENTATIVE">Tentative</option><option value="AWAITING_CONTRACT">Awaiting contract</option><option value="AWAITING_DEPOSIT">Awaiting deposit</option><option value="CONFIRMED">Confirmed</option></select></label>
        <label><span>Title</span><input name="title" required /></label>
        <label><span>Event type</span><input name="eventType" /></label>
        <label><span>Event date</span><input type="date" name="eventDate" required /></label>
        <label><span>Guest count</span><input type="number" name="guestCount" min="0" /></label>
        <label><span>Start time</span><input type="time" name="startTime" /></label>
        <label><span>End time</span><input type="time" name="endTime" /></label>
        <label><span>Total price</span><input type="number" name="totalPrice" min="0" step="0.01" /></label>
        <label><span>Amount paid so far</span><input type="number" name="amountPaid" min="0" step="0.01" /></label>
        <label className="full"><span>Internal notes</span><textarea name="internalNotes" /></label>
        <div className="full"><button type="submit">Create event</button></div>
      </form>
    </div>
  );
}
