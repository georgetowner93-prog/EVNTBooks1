import { getDashboardData } from '@/lib/dashboard';
import { SectionCard, StatCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';

function money(value: number) {
  return `£${value.toFixed(2)}`;
}

export default async function DashboardPage() {
  const {
    org,
    stats,
    unpaidInvoices,
    upcomingEvents,
    recentEnquiries,
    recentExpenses,
    emailTemplates,
    automationRules,
    bookingForms,
    formSubmissions,
    bankAccounts,
    recentTransactions,
    availabilityBlocks,
    taxPeriod,
    profitableEvents,
    upcomingPerformerPayouts,
  } = await getDashboardData();

  return (
    <div className="stack">
      <section className="heroPanel">
        <div>
          <div className="eyebrow">Stage 4 build</div>
          <h1>{org.name}</h1>
          <p className="muted heroText">
            Multi-tenant EVNTBooks workspace with reseller admin controls, tenant-scoped data access, performer payouts, banking, and tax dashboards.
          </p>
        </div>
        <div className="heroGrid">
          <div className="heroMetric">
            <span className="muted small">This month</span>
            <strong>{money(stats.monthRevenue)}</strong>
            <span className="small success">Income collected</span>
          </div>
          <div className="heroMetric">
            <span className="muted small">Expenses</span>
            <strong>{money(stats.monthExpensesTotal)}</strong>
            <span className="small">Tracked from manual + bank feed</span>
          </div>
          <div className="heroMetric">
            <span className="muted small">Estimated profit</span>
            <strong>{money(stats.estimatedProfit)}</strong>
            <span className="small">Before final tax adjustments</span>
          </div>
          <div className="heroMetric">
            <span className="muted small">Tax set-aside</span>
            <strong>{money(stats.taxSetAside)}</strong>
            <span className="small">Simple 20% starter estimate</span>
          </div>
        </div>
      </section>

      <div className="grid cols4">
        <StatCard label="Enquiries" value={stats.enquiryCount} />
        <StatCard label="Events" value={stats.eventCount} />
        <StatCard label="Invoices" value={stats.invoiceCount} />
        <StatCard label="Quotes / contracts" value={`${stats.quoteCount} / ${stats.contractCount}`} />
      </div>

      <div className="grid cols2">
        <SectionCard title="Booking pipeline">
          <div className="kanbanMini">
            <div><span className="pill">New</span><strong>{recentEnquiries.filter((item) => item.status === 'NEW').length}</strong></div>
            <div><span className="pill">Quoted</span><strong>{recentEnquiries.filter((item) => item.status === 'QUOTED').length}</strong></div>
            <div><span className="pill">Confirmed</span><strong>{recentEnquiries.filter((item) => item.status === 'CONFIRMED').length}</strong></div>
            <div><span className="pill">Lost</span><strong>{recentEnquiries.filter((item) => item.status === 'LOST').length}</strong></div>
          </div>
        </SectionCard>

        <SectionCard title="Bank feed health">
          <div className="stack">
            {bankAccounts.map((account) => (
              <div key={account.id} className="infoRow">
                <div>
                  <strong>{account.bankName}</strong>
                  <div className="muted small">{account.accountName} · {account.maskedAccount}</div>
                </div>
                <div className="rightAlign small">
                  <div className="pill">{account.status}</div>
                  <div className="muted">Last sync {account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString('en-GB') : '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid cols2">
        <SectionCard title="Upcoming events + holds">
          <SimpleTable
            headers={['Date', 'Item', 'Client / type', 'Status']}
            rows={[
              ...upcomingEvents.map((event) => [
                new Date(event.eventDate).toLocaleDateString('en-GB'),
                event.title,
                event.clientAccount.displayName,
                <span className="pill" key={event.id}>{event.status.replaceAll('_', ' ')}</span>
              ]),
              ...availabilityBlocks.map((block) => [
                new Date(block.startsAt).toLocaleDateString('en-GB'),
                block.title,
                block.blockType,
                <span className="pill" key={block.id}>calendar hold</span>
              ])
            ]}
          />
        </SectionCard>

        <SectionCard title="Unpaid invoices">
          <SimpleTable
            headers={['Invoice', 'Client', 'Due', 'Balance']}
            rows={unpaidInvoices.map((invoice) => [
              invoice.invoiceNumber,
              invoice.clientAccount.displayName,
              new Date(invoice.dueDate).toLocaleDateString('en-GB'),
              money(invoice.amountDue)
            ])}
          />
        </SectionCard>
      </div>

      <div className="grid cols2">
        <SectionCard title="Automations">
          <SimpleTable
            headers={['Rule', 'Trigger', 'Action', 'State']}
            rows={automationRules.map((rule) => [
              rule.name,
              rule.triggerType,
              rule.actionType,
              <span className="pill" key={rule.id}>{rule.isEnabled ? 'enabled' : 'disabled'}</span>
            ])}
          />
        </SectionCard>

        <SectionCard title="Email templates">
          <SimpleTable
            headers={['Template', 'Trigger', 'Subject']}
            rows={emailTemplates.map((template) => [
              template.name,
              template.triggerType,
              template.subject,
            ])}
          />
        </SectionCard>
      </div>

      <div className="grid cols2">
        <SectionCard title="Booking form widget">
          <div className="stack">
            {bookingForms.map((form) => (
              <div className="snippet" key={form.id}>
                <div className="sectionHeader compact">
                  <strong>{form.name}</strong>
                  <span className="pill">/{form.slug}</span>
                </div>
                <code>{`<iframe src="https://your-domain.com/forms/${form.slug}" width="100%" height="760"></iframe>`}</code>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent form submissions">
          <SimpleTable
            headers={['Received', 'Contact', 'Event', 'Email']}
            rows={formSubmissions.map((submission) => [
              new Date(submission.createdAt).toLocaleDateString('en-GB'),
              submission.contactName,
              submission.eventType ?? '—',
              submission.email,
            ])}
          />
        </SectionCard>
      </div>

      <div className="grid cols2">
        <SectionCard title={`Tax period ${taxPeriod?.label ?? 'current'}`}>
          <div className="stack">
            <div className="infoRow"><span>Estimated profit</span><strong>{money(stats.estimatedProfit)}</strong></div>
            <div className="infoRow"><span>Estimated tax set-aside</span><strong>{money(stats.taxSetAside)}</strong></div>
            <div className="infoRow"><span>Status</span><span className="pill">{taxPeriod?.status ?? 'OPEN'}</span></div>
            <p className="muted small">This module is built as a starter dashboard. It is not a finished HMRC filing workflow yet.</p>
          </div>
        </SectionCard>

        <SectionCard title="Open Banking launchpad">
          <div className="stack">
            <div className="pill">Provider-ready TrueLayer auth route</div>
            <div className="pill">Transaction sync scaffold</div>
            <div className="pill">Auto expense categorisation fields</div>
            <div className="pill">Profit-per-event matching</div>
          </div>
        </SectionCard>
      </div>


      <div className="grid cols2">
        <SectionCard title="Upcoming performer payouts">
          <SimpleTable
            headers={['Performer', 'Event', 'Due', 'Fee', 'Status']}
            rows={upcomingPerformerPayouts.map((assignment) => [
              assignment.performer.displayName,
              assignment.event.title,
              assignment.payoutDueDate ? new Date(assignment.payoutDueDate).toLocaleDateString('en-GB') : '—',
              money(assignment.fee + assignment.travelFee),
              <span className="pill" key={assignment.id}>{assignment.payoutStatus}</span>
            ])}
          />
        </SectionCard>

        <SectionCard title="Performer ops">
          <div className="stack">
            <div className="pill">Assign multiple performers to a booking</div>
            <div className="pill">Send date, times, venue and notes as a performer pack</div>
            <div className="pill">Prepare bank payout or send yourself SMS reminders</div>
            <div className="pill">Performer fees now count toward profit per event</div>
          </div>
        </SectionCard>
      </div>

      <div className="grid cols2">
        <SectionCard title="Most profitable events">
          <SimpleTable
            headers={['Event', 'Client', 'Revenue', 'Costs', 'Profit']}
            rows={profitableEvents.map((event) => [
              event.title,
              event.client,
              money(event.revenueBase),
              money(event.costBase),
              money(event.profit)
            ])}
          />
        </SectionCard>

        <SectionCard title="Recent expenses">
          <SimpleTable
            headers={['Date', 'Description', 'Category', 'Amount']}
            rows={recentExpenses.map((expense) => [
              new Date(expense.expenseDate).toLocaleDateString('en-GB'),
              expense.description,
              expense.category,
              money(expense.amount)
            ])}
          />
        </SectionCard>
      </div>

      <SectionCard title="Recent bank transactions">
        <SimpleTable
          headers={['Posted', 'Description', 'Direction', 'Category', 'Amount', 'Review']}
          rows={recentTransactions.map((tx) => [
            new Date(tx.postedAt).toLocaleDateString('en-GB'),
            tx.description,
            tx.direction,
            tx.category ?? '—',
            money(tx.amount),
            tx.reviewStatus
          ])}
        />
      </SectionCard>
    </div>
  );
}
