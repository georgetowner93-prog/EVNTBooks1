import { SectionCard } from '@/components/Cards';
import { NewButton, SimpleTable } from '@/components/Tables';
import { getEventProfitRows, formatMoney } from '@/lib/profit';

export default async function EventsPage() {
  const events = await getEventProfitRows();

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Events</h1><div className="muted">Your bookings, now with automatic profit-per-event tracking.</div></div></header>
      <SectionCard title="All events" action={<NewButton href="/events/new" label="New event" />}>
        <SimpleTable headers={['Date', 'Title', 'Client', 'Status', 'Revenue', 'Direct costs', 'Performer costs', 'Profit', 'Margin']} rows={events.map((event) => [
          new Date(event.date).toLocaleDateString('en-GB'),
          event.title,
          event.client,
          <span className="pill" key={event.id}>{event.status.replaceAll('_', ' ')}</span>,
          formatMoney(event.revenueBase),
          formatMoney(event.costBase),
          formatMoney(event.performerCosts),
          <strong key={`${event.id}-profit`}>{formatMoney(event.profit)}</strong>,
          `${event.margin.toFixed(1)}%`
        ])} />
      </SectionCard>
    </div>
  );
}
