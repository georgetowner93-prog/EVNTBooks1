import { prisma } from '@/lib/prisma';
import { requireTenantContext } from '@/lib/tenant';

export async function getPerformerDashboard() {
  const { org } = await requireTenantContext();

  const [performers, assignments] = await Promise.all([
    prisma.performer.findMany({ where: { organizationId: org.id }, orderBy: { displayName: 'asc' } }),
    prisma.eventPerformerAssignment.findMany({
      where: { organizationId: org.id },
      include: { performer: true, event: { include: { clientAccount: true } } },
      orderBy: [{ payoutDueDate: 'asc' }, { createdAt: 'desc' }]
    })
  ]);

  return {
    performers,
    assignments,
    payoutTotal: assignments.reduce((sum, item) => sum + item.fee + item.travelFee, 0),
    dueSoon: assignments.filter((item) => item.payoutStatus !== 'PAID').length,
  };
}
