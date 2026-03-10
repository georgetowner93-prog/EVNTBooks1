import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import { logoutAction } from '@/lib/actions';
import { APP_NAME } from '@/lib/constants';

const nav = [
  ['Dashboard', '/'],
  ['Calendar', '/calendar'],
  ['Enquiries', '/enquiries'],
  ['Clients', '/clients'],
  ['Events', '/events'],
  ['Performers', '/performers'],
  ['Invoices', '/invoices'],
  ['Quotes', '/quotes'],
  ['Contracts', '/contracts'],
  ['Client portal', '/portal'],
  ['Automations', '/automation'],
  ['Booking form', '/booking-form'],
  ['Expenses', '/expenses'],
  ['Banking', '/banking'],
  ['Tax', '/tax'],
  ['Deposits', '/deposits'],
  ['Security', '/security'],
  ['Reseller admin', '/admin']
] as const;

export async function Layout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) return <main>{children}</main>;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <h1>{APP_NAME}</h1>
          <p className="muted">Bookings, banking and tax</p>
          <div className="userBlock">
            <div className="muted">Signed in as</div>
            <div>{session.name}</div>
            <div className="muted small">{session.email}</div>
          </div>
        </div>
        <nav>
          {nav.filter(([label]) => session.isPlatformAdmin ? label === 'Reseller admin' : label !== 'Reseller admin').map(([label, href]) => (
            <Link key={href} href={href} className="navLink">
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="button ghost fullWidth">Sign out</button>
        </form>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
