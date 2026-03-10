'use client';

import { useActionState } from 'react';
import { enableTwoFactorAction } from '@/lib/actions';

type Props = {
  secret: string;
  qrCodeDataUrl: string;
};

const initialState = {
  error: '',
  recoveryCodes: [] as string[]
};

export function TwoFactorSetup({ secret, qrCodeDataUrl }: Props) {
  const [state, formAction, pending] = useActionState(enableTwoFactorAction, initialState);

  return (
    <div className="grid cols2">
      <div className="stack">
        <p>1. Scan this QR code with Google Authenticator, 1Password, Authy, or another TOTP app.</p>
        <img src={qrCodeDataUrl} alt="TOTP QR code" style={{ width: 240, height: 240, background: '#fff', borderRadius: 12, padding: 12 }} />
        <div className="muted small">Manual setup secret:</div>
        <pre className="card">{secret}</pre>
      </div>
      <div className="stack">
        <form action={formAction} className="stack card">
          <input type="hidden" name="secret" value={secret} />
          <label>
            Verification code
            <input type="text" name="code" placeholder="123456" required />
          </label>
          <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Enable 2FA and generate recovery codes'}</button>
          {state.error ? <div className="error">{state.error}</div> : null}
        </form>
        {state.recoveryCodes.length ? (
          <div className="card stack">
            <strong>Recovery codes</strong>
            <div className="muted small">Store these offline. They are shown only once.</div>
            <div className="codeGrid">
              {state.recoveryCodes.map((code) => <div key={code} className="pill">{code}</div>)}
            </div>
          </div>
        ) : (
          <p className="muted small">After saving, recovery codes will be shown once. Store them offline.</p>
        )}
      </div>
    </div>
  );
}
