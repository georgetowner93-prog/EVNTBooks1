import { SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';
import { getPlatformAdminOverview } from '@/lib/tenant';
import { activateCompanyAction, createCompanyAction, suspendCompanyAction } from '@/lib/actions';

export default async function AdminPage() {
  const { companies } = await getPlatformAdminOverview();

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Reseller admin</h1><div className="muted">Create and manage tenant companies from one control panel.</div></div></header>

      <SectionCard title="Create a company">
        <form action={createCompanyAction} className="formGrid">
          <input name="name" placeholder="Company name" required />
          <input name="slug" placeholder="company-slug" required />
          <input name="ownerEmail" placeholder="owner@example.com" type="email" required />
          <input name="ownerFirstName" placeholder="Owner first name" />
          <input name="ownerLastName" placeholder="Owner last name" />
          <input name="ownerPassword" placeholder="Temporary password" required />
          <button className="button" type="submit">Create company</button>
        </form>
      </SectionCard>

      <SectionCard title="Tenants">
        <SimpleTable
          headers={['Company', 'Slug', 'Owner email', 'Status', 'Users', 'Events', 'Invoices', 'Action']}
          rows={companies.map((company) => [
            company.name,
            company.slug,
            company.ownerEmail ?? company.email ?? '—',
            <span className="pill" key={`${company.id}-status`}>{company.status}</span>,
            String(company._count.users),
            String(company._count.events),
            String(company._count.invoices),
            company.status === 'ACTIVE' ? (
              <form key={`${company.id}-suspend`} action={suspendCompanyAction}>
                <input type="hidden" name="organizationId" value={company.id} />
                <button className="button ghost" type="submit">Suspend</button>
              </form>
            ) : (
              <form key={`${company.id}-activate`} action={activateCompanyAction}>
                <input type="hidden" name="organizationId" value={company.id} />
                <button className="button" type="submit">Activate</button>
              </form>
            )
          ])}
        />
      </SectionCard>
    </div>
  );
}
