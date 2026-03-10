import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { createInvoice } from '@/lib/actions';

export default async function NewInvoicePage() {
  const { org } = await requireTenantContext();
  const clients = await prisma.clientAccount.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } });
  const events = await prisma.event.findMany({ where: { organizationId: org.id }, orderBy: { eventDate: 'asc' } });

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>New invoice</h1><div className="muted">Create deposit, balance, or standard invoice.</div></div></header>
      <form action={createInvoice} className="card formGrid">
        <label><span>Invoice number</span><input name="invoiceNumber" required /></label>
        <label><span>Type</span><select name="type"><option value="STANDARD">Standard</option><option value="DEPOSIT">Deposit</option><option value="BALANCE">Balance</option><option value="REFUND">Refund</option></select></label>
        <label><span>Status</span><select name="status"><option value="DRAFT">Draft</option><option value="SENT">Sent</option><option value="PARTIAL">Partial</option><option value="PAID">Paid</option></select></label>
        <label><span>Client</span><select name="clientAccountId" required>{clients.map((client) => <option key={client.id} value={client.id}>{client.displayName}</option>)}</select></label>
        <label><span>Event</span><select name="eventId"><option value="">No linked event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
        <label><span>Issue date</span><input type="date" name="issueDate" required /></label>
        <label><span>Due date</span><input type="date" name="dueDate" required /></label>
        <label><span>Total</span><input type="number" name="total" min="0" step="0.01" required /></label>
        <label className="full"><span>Notes</span><textarea name="notes" /></label>
        <div className="full"><button type="submit">Create invoice</button></div>
      </form>
    </div>
  );
}
