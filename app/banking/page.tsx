import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { NoteBox, SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';
import { hasTrueLayerConfig } from '@/lib/banking/truelayer';

export default async function BankingPage() {
  const { org } = await requireTenantContext();
  const [accounts, transactions] = await Promise.all([
    prisma.bankAccountConnection.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } }),
    prisma.bankTransaction.findMany({ where: { organizationId: org.id }, include: { event: true }, orderBy: { postedAt: 'desc' } })
  ]);

  const connected = hasTrueLayerConfig();

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Banking</h1><div className="muted">Provider-ready Open Banking flow using TrueLayer-style account authorisation and transaction sync.</div></div></header>

      <div className="grid cols2">
        <SectionCard title="Open Banking integration status">
          <div className="stack">
            <div className="infoRow"><span>Provider adapter</span><strong>TrueLayer</strong></div>
            <div className="infoRow"><span>Environment config</span><span className="pill">{connected ? 'ready to connect' : 'add sandbox keys'}</span></div>
            <div className="infoRow"><span>Sync mode</span><strong>Accounts, balances, transactions</strong></div>
            <p className="muted small">This build includes the provider-ready auth URL builder, callback scaffold, sync route, transaction matching fields, and seeded demo data. To make it live you only need your provider credentials and redirect URL.</p>
          </div>
        </SectionCard>

        <SectionCard title="What gets auto-matched">
          <div className="stack">
            <div className="pill">Invoice deposits against money-in transactions</div>
            <div className="pill">Expense suggestions from merchant names and categories</div>
            <div className="pill">Event-linked spend for travel, assistants, fuel and subcontractors</div>
            <div className="pill">Profit per event from revenue minus matched direct costs</div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Connected accounts">
        <div className="stack">
          {accounts.map((account) => (
            <div className="infoRow" key={account.id}>
              <div>
                <strong>{account.bankName}</strong>
                <div className="muted small">{account.accountName} · {account.maskedAccount} · {account.providerName}</div>
              </div>
              <div className="rightAlign small">
                <div className="pill">{account.status}</div>
                <div className="muted">Last sync {account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString('en-GB') : '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Transaction feed">
        <SimpleTable headers={['Posted', 'Description', 'Direction', 'Category', 'Event match', 'Amount', 'Review']} rows={transactions.map((tx) => [
          new Date(tx.postedAt).toLocaleDateString('en-GB'),
          tx.description,
          tx.direction,
          tx.category ?? '—',
          tx.event?.title ?? tx.bookingMatchNote ?? '—',
          `£${tx.amount.toFixed(2)}`,
          tx.reviewStatus
        ])} />
      </SectionCard>

      <NoteBox>
        <strong>Live activation checklist</strong>
        <div className="muted small">Add your TrueLayer sandbox or live credentials to <code>.env</code>, point the redirect URL at <code>/api/banking/callback</code>, and wire your webhook or scheduled sync job. I left the data model and routes ready for that next step.</div>
      </NoteBox>
    </div>
  );
}
