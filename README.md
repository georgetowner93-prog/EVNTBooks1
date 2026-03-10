# EVNTBooks

This is a more serious MVP starter for an events booking system with:

- secure email/password authentication
- Argon2 password hashing
- TOTP 2FA with authenticator apps
- hashed recovery codes
- login throttling and temporary account lockout
- secure HttpOnly session cookies
- protected app routes via middleware
- dashboard, enquiries, clients, events, invoices
- quotes, contracts, and Stripe deposit scaffolding

## Important security notes

- Passwords are never stored in plain text.
- Passwords are hashed with Argon2.
- TOTP secrets are encrypted at rest using AES-256-GCM.
- Recovery codes are stored as hashes, not plain text.
- Sessions are stored in a signed JWT cookie that is HttpOnly and `sameSite=lax`.
- In production, cookies are marked `secure` automatically.
- Failed login attempts are counted per user and the account is temporarily locked after repeated failures.

## Quick start

```bash
npm install
cp .env.example .env
# set AUTH_SECRET and APP_ENCRYPTION_KEY to strong random values
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Then sign in with:

- email: value of `SEED_ADMIN_EMAIL`
- password: value of `SEED_ADMIN_PASSWORD`

## Generate secrets

Use something like this:

```bash
openssl rand -base64 33
openssl rand -hex 32
```

## What Step 2 includes vs. what is scaffolded

Fully included:
- secure auth
- 2FA setup and verification
- protected pages
- quote CRUD starter
- contract CRUD starter
- Stripe deposit integration placeholder routes and UI

Scaffolded but not production-complete yet:
- payment provider webhooks
- e-signature capture UX
- email delivery
- calendar sync
- audit trails for every action
- tenant isolation hardening for a multi-org SaaS deployment

## Recommended production hardening before launch

- add email verification
- add CSRF tokens for custom POST routes if you expand beyond same-site form posts
- add WebAuthn/passkeys later for admins
- add Redis-backed rate limiting
- add structured audit logging and SIEM hooks
- store secrets in a proper secret manager
- add backups, monitoring, and vulnerability scanning


## Open Banking + profit per event

This build adds a provider-ready Open Banking scaffold aimed at UK event businesses:
- TrueLayer-style auth link builder
- callback route scaffold at `/api/banking/callback`
- sync route scaffold at `/api/banking/sync`
- bank transaction fields for external IDs, confidence scores and event matches
- event-level profit tracking from booking value minus matched direct costs

To make the bank feed live, add your provider credentials in `.env` and then finish the token exchange + scheduled sync job for your chosen provider account.


## Performers module

This version adds a performers roster, event assignments, performer packs, payout tracking, and payout reminders. Open Banking payout prep is scaffolded, but live payment initiation and SMS delivery still need provider credentials and final wiring.


## Stage 4: reseller admin + tenant isolation

This build adds a real Stage 4 starter for multi-tenant SaaS use:
- platform admin panel at `/admin`
- create/suspend/reactivate tenant companies
- tenant sessions scoped by `organizationId`
- platform admins separated from tenant users
- tenant pages now resolve the current organization from the signed session instead of a hard-coded demo slug

Important: this is a serious starter, not a finished compliance claim. Sensitive fields still need deeper field-by-field encryption review before production launch, plus row-level security if you move to Postgres.
