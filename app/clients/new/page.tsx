import { createClient } from '@/lib/actions';

export default function NewClientPage() {
  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>New client</h1><div className="muted">Add an individual or company account.</div></div></header>
      <form action={createClient} className="card formGrid">
        <label><span>Display name</span><input name="displayName" required /></label>
        <label><span>Type</span><select name="type"><option value="INDIVIDUAL">Individual</option><option value="COMPANY">Company</option></select></label>
        <label><span>Billing email</span><input type="email" name="billingEmail" /></label>
        <label><span>Billing phone</span><input name="billingPhone" /></label>
        <label className="full"><span>Notes</span><textarea name="notes" /></label>
        <div className="full"><button type="submit">Create client</button></div>
      </form>
    </div>
  );
}
