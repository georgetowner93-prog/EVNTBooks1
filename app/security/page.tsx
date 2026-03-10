import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { SectionCard } from '@/components/Cards';
import { prepareTwoFactorSetup, disableTwoFactorAction } from '@/lib/actions';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';

export default async function SecurityPage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) throw new Error('User not found');

  const setup = !user.twoFactorEnabled ? await prepareTwoFactorSetup() : null;

  return (
    <div className="stack">
      <header className="pageHeader">
        <div>
          <h1>Security</h1>
          <div className="muted">Manage password and two-factor settings for your account.</div>
        </div>
      </header>

      <SectionCard title="Account protection">
        <div className="stack">
          <div>
            <strong>2FA status:</strong> {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </div>
          <div className="muted small">
            Passwords are stored as Argon2 hashes. TOTP secrets are encrypted at rest. Recovery codes are hashed.
          </div>
        </div>
      </SectionCard>

      {user.twoFactorEnabled ? (
        <SectionCard title="Disable 2FA">
          <form action={disableTwoFactorAction} className="stack">
            <p className="muted">Only disable this temporarily. For admin accounts, keeping 2FA enabled is strongly recommended.</p>
            <button type="submit" className="button ghost">Disable two-factor authentication</button>
          </form>
        </SectionCard>
      ) : setup ? (
        <SectionCard title="Enable authenticator-app 2FA">
          <TwoFactorSetup secret={setup.secret} qrCodeDataUrl={setup.qrCodeDataUrl} />
        </SectionCard>
      ) : null}
    </div>
  );
}
