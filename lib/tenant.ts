import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export async function requireTenantContext() {
  const session = await requireSession();
  if (session.isPlatformAdmin) {
    throw new Error('Platform admins must switch into a tenant workspace to view tenant pages.');
  }
  const org = await prisma.organization.findUnique({ where: { id: session.orgId ?? '' } });
  if (!org) throw new Error('Organization not found for this session.');
  if (org.status !== 'ACTIVE') throw new Error('This tenant is suspended.');
  return { session, org };
}

export async function getPlatformAdminOverview() {
  const session = await requireSession();
  if (!session.isPlatformAdmin) throw new Error('Forbidden');
  const companies = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: { users: { orderBy: { createdAt: 'asc' } }, _count: { select: { users: true, events: true, invoices: true } } }
  });
  return { session, companies };
}
