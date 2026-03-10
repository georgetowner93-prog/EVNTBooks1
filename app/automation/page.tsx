import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';
import { SectionCard } from '@/components/Cards';
import { SimpleTable } from '@/components/Tables';

export default async function AutomationPage() {
  const { org } = await requireTenantContext();
  const [rules, templates] = await Promise.all([
    prisma.automationRule.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } }),
    prisma.emailTemplate.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="stack">
      <header className="pageHeader"><div><h1>Email automations</h1><div className="muted">Starter rules for enquiries, reminders, confirmations and payment chases.</div></div></header>
      <div className="grid cols2">
        <SectionCard title="Automation rules">
          <SimpleTable headers={['Rule', 'Trigger', 'Action', 'Enabled']} rows={rules.map((rule) => [
            rule.name,
            rule.triggerType,
            rule.actionType,
            rule.isEnabled ? 'Yes' : 'No'
          ])} />
        </SectionCard>
        <SectionCard title="Template library">
          <SimpleTable headers={['Name', 'Trigger', 'Subject']} rows={templates.map((template) => [
            template.name,
            template.triggerType,
            template.subject
          ])} />
        </SectionCard>
      </div>
    </div>
  );
}
