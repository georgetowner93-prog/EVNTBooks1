import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard } from '@/components/Cards';

export default async function CalendarPage() {
  const { org } = await requireTenantContext();
  const [events, blocks] = await Promise.all([
    prisma.event.findMany({ where: { organizationId: org.id }, include: { clientAccount: true }, orderBy: { eventDate: 'asc' } }),
    prisma.availabilityBlock.findMany({ where: { organizationId: org.id }, orderBy: { startsAt: 'asc' } })
  ]);

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Calendar</h1><div className="muted">Visual run sheet starter for bookings, travel holds and blocked dates.</div></div></header>
      <SectionCard title="Timeline">
        <div className="calendarList">
          {events.map((event) => (
            <div className="calendarItem" key={event.id}>
              <div>
                <div className="calendarDate">{new Date(event.eventDate).toLocaleDateString('en-GB')}</div>
                <strong>{event.title}</strong>
                <div className="muted small">{event.startTime ?? 'TBC'}–{event.endTime ?? 'TBC'} · {event.clientAccount.displayName}</div>
              </div>
              <span className="pill">{event.status}</span>
            </div>
          ))}
          {blocks.map((block) => (
            <div className="calendarItem hold" key={block.id}>
              <div>
                <div className="calendarDate">{new Date(block.startsAt).toLocaleDateString('en-GB')}</div>
                <strong>{block.title}</strong>
                <div className="muted small">{new Date(block.startsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–{new Date(block.endsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <span className="pill">{block.blockType}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
