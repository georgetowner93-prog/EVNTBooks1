import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  if (session) redirect('/');
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : '';
  const next = typeof params.next === 'string' ? params.next : '/';

  return (
    <div className="authShell">
      <div className="authCard stack">
        <div>
          <h1>Sign in</h1>
          <p className="muted">Secure password login with optional authenticator-app 2FA.</p>
        </div>
        {error ? <div className="error">{decodeURIComponent(error)}</div> : null}
        <form method="post" action="/api/auth/login" className="stack">
          <input type="hidden" name="next" value={next} />
          <label>
            Email
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <label>
            Two-factor code
            <input type="text" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456 or a recovery code" />
          </label>
          <button type="submit">Sign in</button>
        </form>
        <div className="muted small">
          Tenant seed login uses <span className="kbd">SEED_ADMIN_EMAIL</span> and <span className="kbd">SEED_ADMIN_PASSWORD</span>. Platform admin seed login uses <span className="kbd">platform-admin@evntbooks.test</span> and <span className="kbd">SEED_PLATFORM_PASSWORD</span>.
        </div>
      </div>
    </div>
  );
}
