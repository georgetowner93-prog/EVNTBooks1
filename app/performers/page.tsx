import { SectionCard, StatCard, NoteBox } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';
import { getPerformerDashboard } from '@/lib/performers';
import { formatMoney } from '@/lib/profit';

export default async function PerformersPage() {
  const { performers, assignments, payoutTotal, dueSoon } = await getPerformerDashboard();

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Performers</h1><div className="muted">Assign performers to bookings, send them the run sheet, and track payout prep or reminders.</div></div></header>

      <div className="grid cols4">
        <StatCard label="Performer profiles" value={performers.length} />
        <StatCard label="Active assignments" value={assignments.length} />
        <StatCard label="Pending payouts" value={dueSoon} />
        <StatCard label="Assigned payout value" value={formatMoney(payoutTotal)} />
      </div>

      <div className="grid cols2">
        <SectionCard title="Performer roster">
          <SimpleTable headers={['Performer', 'Role', 'Contact', 'Default fee', 'Payout mode']} rows={performers.map((performer) => [
            performer.stageName ? `${performer.displayName} (${performer.stageName})` : performer.displayName,
            performer.role,
            performer.phone ?? performer.email ?? '—',
            formatMoney(performer.defaultFee + performer.defaultTravelFee),
            performer.canUseOpenBankingPayout ? 'Bank payout ready' : 'Reminder only'
          ])} />
        </SectionCard>

        <SectionCard title="How this works">
          <div className="stack">
            <div className="pill">Link one or many performers to each booking</div>
            <div className="pill">Store call time, set time, venue, notes and payout due date</div>
            <div className="pill">Prepare a bank payment where supported</div>
            <div className="pill">Or send yourself SMS/email reminders until marked paid</div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Assignments + payouts">
        <SimpleTable headers={['Event', 'Performer', 'Date', 'Call / set', 'Location', 'Pack', 'Payout', 'Reminder']} rows={assignments.map((assignment) => [
          `${assignment.event.title} · ${assignment.event.clientAccount.displayName}`,
          assignment.performer.displayName,
          new Date(assignment.event.eventDate).toLocaleDateString('en-GB'),
          `${assignment.callTime ?? '—'} / ${assignment.performanceStart ?? '—'}-${assignment.performanceEnd ?? '—'}`,
          assignment.locationSnapshot ?? 'Venue to confirm',
          assignment.packSentAt ? 'Sent' : 'Ready to send',
          `${formatMoney(assignment.fee + assignment.travelFee)} · ${assignment.payoutStatus}`,
          assignment.payoutReminderChannel
        ])} />
      </SectionCard>

      <div className="grid cols2">
        <SectionCard title="Performer pack template">
          <div className="snippet">
            <strong>Subject:</strong> Your EVNTBooks performer brief
            <p className="muted small">Event: Wedding reception DJ set
            <br />Date: 20/06/2026
            <br />Venue: Liverpool Waterfront Suite
            <br />Call time: 17:30
            <br />Performance: 19:00 to 23:30
            <br />Notes: Arrive via rear loading bay. Smart black attire. Client contact on the day: Emma Clarke.</p>
          </div>
        </SectionCard>

        <SectionCard title="Payout automation">
          <div className="stack">
            <div className="infoRow"><span>Open Banking payout prep</span><span className="pill">scaffolded</span></div>
            <div className="infoRow"><span>SMS reminders to you</span><span className="pill">ready to wire</span></div>
            <div className="infoRow"><span>Email reminders fallback</span><span className="pill">included</span></div>
            <p className="muted small">This build stores payout-ready beneficiary metadata and reminder preferences. You still need a live provider and messaging credentials to send real payments or texts.</p>
          </div>
        </SectionCard>
      </div>

      <NoteBox>
        <strong>Important:</strong> performer bank details are stored here only as payout-reference metadata and masked account hints in this starter. Real production payout flows should use a regulated provider, approval steps, and encrypted secret storage for anything sensitive.
      </NoteBox>
    </div>
  );
}
