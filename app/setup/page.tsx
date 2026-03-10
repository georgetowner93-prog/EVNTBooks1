'use client';

import { FormEvent, useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const form = new FormData(e.currentTarget);

    const payload = {
      platformName: String(form.get('platformName') || ''),
      companyName: String(form.get('companyName') || ''),
      adminName: String(form.get('adminName') || ''),
      adminEmail: String(form.get('adminEmail') || ''),
      adminPassword: String(form.get('adminPassword') || ''),
    };

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Setup failed');
      setLoading(false);
      return;
    }

    setSuccess('Setup complete. You can now log in.');
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>EVNTBooks Setup</h1>
      <p style={{ marginBottom: 24 }}>
        Create your first platform admin and company.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
        <div>
          <label>Platform Name</label>
          <input name="platformName" defaultValue="EVNTBooks" required style={inputStyle} />
        </div>

        <div>
          <label>Company Name</label>
          <input name="companyName" required style={inputStyle} />
        </div>

        <div>
          <label>Your Name</label>
          <input name="adminName" required style={inputStyle} />
        </div>

        <div>
          <label>Email</label>
          <input name="adminEmail" type="email" required style={inputStyle} />
        </div>

        <div>
          <label>Password</label>
          <input name="adminPassword" type="password" minLength={10} required style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating account...' : 'Create EVNTBooks Admin'}
        </button>

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        {success ? <p style={{ color: 'green' }}>{success}</p> : null}
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  border: '1px solid #ccc',
  borderRadius: 8,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
};