import { SectionCard } from '@/components/Cards';

export default function DepositsPage() {
  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Deposits</h1><div className="muted">Stripe deposit checkout scaffold.</div></div></header>
      <SectionCard title="What is included right now">
        <div className="stack">
          <p>This step includes the product structure for deposit collection, but not a live Stripe integration yet.</p>
          <p>Next implementation steps are:</p>
          <div className="card">
            <pre>{`POST /api/stripe/create-deposit-session
POST /api/stripe/webhook
Link invoice -> checkout session -> payment -> invoice amountPaid/amountDue update`}</pre>
          </div>
          <p className="muted small">That keeps this starter safe and runnable without forcing payment secrets into the demo project.</p>
        </div>
      </SectionCard>
    </div>
  );
}
