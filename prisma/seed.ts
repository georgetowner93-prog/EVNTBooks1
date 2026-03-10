import {
  PrismaClient,
  ClientAccountType,
  EnquirySource,
  EnquiryStatus,
  EventStatus,
  InvoiceStatus,
  InvoiceType,
  QuoteStatus,
  ContractStatus,
  UserRole,
  ExpenseCategory,
  ExpenseSource,
  TransactionCategory,
  TransactionDirection,
  TaxYearStatus,
  PerformerRole,
  PerformerPayoutStatus,
  ReminderChannel,
} from '@prisma/client';
import { hashPassword, hashRecoveryCode } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMeNow!12345';

  const org = await prisma.organization.upsert({
    where: { slug: 'evntbooks-demo' },
    update: { status: 'ACTIVE', ownerEmail: email },
    create: {
      name: process.env.APP_NAME || 'EVNTBooks Demo',
      slug: 'evntbooks-demo',
      email,
      ownerEmail: email,
      timezone: 'Europe/London',
      currency: 'GBP',
      status: 'ACTIVE'
    }
  });

  const secondOrg = await prisma.organization.upsert({
    where: { slug: 'midnight-sounds' },
    update: { status: 'ACTIVE', ownerEmail: 'owner@midnight-sounds.test' },
    create: {
      name: 'Midnight Sounds Events',
      slug: 'midnight-sounds',
      email: 'owner@midnight-sounds.test',
      ownerEmail: 'owner@midnight-sounds.test',
      timezone: 'Europe/London',
      currency: 'GBP',
      status: 'ACTIVE'
    }
  });

  await prisma.user.upsert({
    where: { email },
    update: {
      firstName: 'Demo',
      lastName: 'Admin',
      organizationId: org.id,
      role: UserRole.ADMIN,
      passwordHash: await hashPassword(password),
      twoFactorEnabled: false,
      twoFactorSecretEnc: null,
      twoFactorRecoveryHash: [hashRecoveryCode('seed-recovery-code-not-for-production')],
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true,
      isPlatformAdmin: false
    },
    create: {
      email,
      firstName: 'Demo',
      lastName: 'Admin',
      organizationId: org.id,
      role: UserRole.ADMIN,
      passwordHash: await hashPassword(password),
      twoFactorEnabled: false,
      twoFactorSecretEnc: null,
      twoFactorRecoveryHash: [hashRecoveryCode('seed-recovery-code-not-for-production')],
      isPlatformAdmin: false
    }
  });

  await prisma.user.upsert({
    where: { email: 'platform-admin@evntbooks.test' },
    update: {
      firstName: 'Platform',
      lastName: 'Admin',
      organizationId: null,
      role: UserRole.ADMIN,
      passwordHash: await hashPassword(process.env.SEED_PLATFORM_PASSWORD || 'ChangeMeNow!12345'),
      isPlatformAdmin: true,
      isActive: true
    },
    create: {
      email: 'platform-admin@evntbooks.test',
      firstName: 'Platform',
      lastName: 'Admin',
      organizationId: null,
      role: UserRole.ADMIN,
      passwordHash: await hashPassword(process.env.SEED_PLATFORM_PASSWORD || 'ChangeMeNow!12345'),
      twoFactorRecoveryHash: [hashRecoveryCode('platform-seed-recovery-code')],
      isPlatformAdmin: true
    }
  });

  await prisma.user.upsert({
    where: { email: 'owner@midnight-sounds.test' },
    update: {
      firstName: 'Midnight',
      lastName: 'Owner',
      organizationId: secondOrg.id,
      role: UserRole.ADMIN,
      passwordHash: await hashPassword('ChangeMeNow!12345'),
      isPlatformAdmin: false,
      isActive: true
    },
    create: {
      email: 'owner@midnight-sounds.test',
      firstName: 'Midnight',
      lastName: 'Owner',
      organizationId: secondOrg.id,
      role: UserRole.ADMIN,
      passwordHash: await hashPassword('ChangeMeNow!12345'),
      twoFactorRecoveryHash: [hashRecoveryCode('midnight-seed-recovery-code')],
      isPlatformAdmin: false
    }
  });

  const clientA = await prisma.clientAccount.upsert({
    where: { id: 'client-a' },
    update: {},
    create: {
      id: 'client-a',
      organizationId: org.id,
      type: ClientAccountType.INDIVIDUAL,
      displayName: 'Emma Clarke',
      billingEmail: 'emma@example.com',
      billingPhone: '07700 900123',
      portalToken: 'portal-emma-demo'
    }
  });

  const clientB = await prisma.clientAccount.upsert({
    where: { id: 'client-b' },
    update: {},
    create: {
      id: 'client-b',
      organizationId: org.id,
      type: ClientAccountType.COMPANY,
      displayName: 'Northlight Events Ltd',
      billingEmail: 'events@northlight.test',
      billingPhone: '0207 555 0101',
      portalToken: 'portal-northlight-demo'
    }
  });

  const eventA = await prisma.event.upsert({
    where: { id: 'event-a' },
    update: {},
    create: {
      id: 'event-a',
      organizationId: org.id,
      clientAccountId: clientA.id,
      title: 'Wedding reception DJ set',
      eventType: 'Wedding',
      status: EventStatus.CONFIRMED,
      eventDate: new Date('2026-06-20T00:00:00.000Z'),
      startTime: '19:00',
      endTime: '23:30',
      guestCount: 120,
      totalPrice: 1400,
      balanceDue: 700,
      internalNotes: 'Arrive 90 mins early for setup.'
    }
  });

  const eventB = await prisma.event.upsert({
    where: { id: 'event-b' },
    update: {},
    create: {
      id: 'event-b',
      organizationId: org.id,
      clientAccountId: clientB.id,
      title: 'Corporate launch host package',
      eventType: 'Corporate',
      status: EventStatus.AWAITING_DEPOSIT,
      eventDate: new Date('2026-07-01T00:00:00.000Z'),
      startTime: '17:00',
      endTime: '22:00',
      guestCount: 220,
      totalPrice: 2800,
      balanceDue: 1400,
      internalNotes: 'Awaiting venue final run sheet.'
    }
  });

  await prisma.enquiry.deleteMany({ where: { organizationId: org.id } });
  await prisma.enquiry.createMany({
    data: [
      {
        organizationId: org.id,
        clientAccountId: clientA.id,
        source: EnquirySource.WEBSITE,
        status: EnquiryStatus.QUOTED,
        eventType: 'Birthday Party',
        eventDate: new Date('2026-05-12T00:00:00.000Z'),
        guestCount: 60,
        budgetMax: 900,
        message: 'Looking for a magician + DJ package.'
      },
      {
        organizationId: org.id,
        clientAccountId: clientB.id,
        source: EnquirySource.REFERRAL,
        status: EnquiryStatus.NEW,
        eventType: 'Corporate launch',
        eventDate: new Date('2026-07-01T00:00:00.000Z'),
        guestCount: 220,
        budgetMax: 3500,
        message: 'Need host, AV coordination and a roaming sax player.'
      }
    ]
  });

  const invoiceA = await prisma.invoice.upsert({
    where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-1001' } },
    update: {},
    create: {
      organizationId: org.id,
      clientAccountId: clientA.id,
      eventId: eventA.id,
      invoiceNumber: 'INV-1001',
      type: InvoiceType.DEPOSIT,
      status: InvoiceStatus.SENT,
      issueDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-15T00:00:00.000Z'),
      total: 700,
      amountPaid: 0,
      amountDue: 700,
      notes: '50% booking deposit.'
    }
  });

  await prisma.invoice.upsert({
    where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-1002' } },
    update: {},
    create: {
      organizationId: org.id,
      clientAccountId: clientB.id,
      eventId: eventB.id,
      invoiceNumber: 'INV-1002',
      type: InvoiceType.DEPOSIT,
      status: InvoiceStatus.PARTIAL,
      issueDate: new Date('2026-03-05T00:00:00.000Z'),
      dueDate: new Date('2026-03-18T00:00:00.000Z'),
      total: 1400,
      amountPaid: 700,
      amountDue: 700,
      notes: 'Corporate booking deposit with staged payment.'
    }
  });

  await prisma.quote.upsert({
    where: { organizationId_quoteNumber: { organizationId: org.id, quoteNumber: 'QUO-1001' } },
    update: {},
    create: {
      organizationId: org.id,
      clientAccountId: clientB.id,
      eventId: eventB.id,
      quoteNumber: 'QUO-1001',
      status: QuoteStatus.SENT,
      validUntil: new Date('2026-04-15T00:00:00.000Z'),
      total: 2800,
      notes: 'Corporate launch host + AV support + roaming entertainment.',
      publicToken: 'quote-demo-token'
    }
  });

  await prisma.contract.upsert({
    where: { organizationId_contractNumber: { organizationId: org.id, contractNumber: 'CON-1001' } },
    update: {},
    create: {
      organizationId: org.id,
      clientAccountId: clientA.id,
      eventId: eventA.id,
      contractNumber: 'CON-1001',
      status: ContractStatus.SENT,
      title: 'Wedding DJ performance agreement',
      body: 'This is a starter contract template. Replace with your own clauses, cancellation terms, public liability wording, and payment schedule.',
      publicToken: 'contract-demo-token'
    }
  });

  await prisma.payment.deleteMany({ where: { organizationId: org.id } });
  await prisma.payment.createMany({
    data: [
      {
        organizationId: org.id,
        eventId: eventB.id,
        amount: 700,
        provider: 'stripe_scaffold',
        status: 'succeeded',
        paidAt: new Date('2026-03-07T09:10:00.000Z')
      },
      {
        organizationId: org.id,
        eventId: eventA.id,
        amount: 300,
        provider: 'bank_transfer',
        status: 'succeeded',
        paidAt: new Date('2026-03-03T14:05:00.000Z')
      }
    ]
  });

  const bank = await prisma.bankAccountConnection.upsert({
    where: { id: 'bank-a' },
    update: {},
    create: {
      id: 'bank-a',
      organizationId: org.id,
      providerName: 'TrueLayer Sandbox',
      bankName: 'Barclays',
      accountName: 'EVNTBooks Business',
      maskedAccount: '•••• 2047',
      status: 'connected',
      lastSyncedAt: new Date('2026-03-09T08:15:00.000Z')
    }
  });

  const tx1 = await prisma.bankTransaction.upsert({
    where: { id: 'txn-a' },
    update: {},
    create: {
      id: 'txn-a',
      organizationId: org.id,
      bankAccountId: bank.id,
      postedAt: new Date('2026-03-08T11:15:00.000Z'),
      description: 'Adobe Creative Cloud',
      amount: 56.98,
      direction: TransactionDirection.MONEY_OUT,
      category: TransactionCategory.SOFTWARE,
      merchantName: 'Adobe',
      reviewStatus: 'reviewed',
      externalTransactionId: 'mock-tx-adobe',
      matchConfidence: 0.96
    }
  });

  const tx2 = await prisma.bankTransaction.upsert({
    where: { id: 'txn-b' },
    update: {},
    create: {
      id: 'txn-b',
      organizationId: org.id,
      bankAccountId: bank.id,
      postedAt: new Date('2026-03-07T09:09:00.000Z'),
      description: 'Northlight Events Ltd deposit',
      amount: 700,
      direction: TransactionDirection.MONEY_IN,
      category: TransactionCategory.BOOKING_INCOME,
      merchantName: 'Northlight Events Ltd',
      bookingMatchNote: 'Matched to INV-1002',
      reviewStatus: 'reviewed',
      externalTransactionId: 'mock-tx-deposit',
      eventId: eventB.id,
      matchConfidence: 0.99,
      counterpartyName: 'Northlight Events Ltd'
    }
  });

  const tx3 = await prisma.bankTransaction.upsert({
    where: { id: 'txn-c' },
    update: {},
    create: {
      id: 'txn-c',
      organizationId: org.id,
      bankAccountId: bank.id,
      postedAt: new Date('2026-03-06T17:40:00.000Z'),
      description: 'Shell fuel',
      amount: 42.15,
      direction: TransactionDirection.MONEY_OUT,
      category: TransactionCategory.TRAVEL,
      merchantName: 'Shell',
      reviewStatus: 'needs_receipt',
      externalTransactionId: 'mock-tx-fuel',
      eventId: eventA.id,
      matchConfidence: 0.92
    }
  });

  await prisma.expense.upsert({
    where: { id: 'exp-a' },
    update: {},
    create: {
      id: 'exp-a',
      organizationId: org.id,
      description: 'Adobe Creative Cloud subscription',
      category: ExpenseCategory.SOFTWARE,
      source: ExpenseSource.BANK_FEED,
      amount: 56.98,
      taxAmount: 9.5,
      expenseDate: new Date('2026-03-08T00:00:00.000Z'),
      supplier: 'Adobe',
      notes: 'Auto-categorised from bank feed.',
      bankTransactionId: tx1.id,
      businessUsePercent: 100
    }
  });

  await prisma.expense.upsert({
    where: { id: 'exp-b' },
    update: {},
    create: {
      id: 'exp-b',
      organizationId: org.id,
      description: 'Fuel to Liverpool wedding booking',
      category: ExpenseCategory.TRAVEL,
      source: ExpenseSource.BANK_FEED,
      amount: 42.15,
      taxAmount: 7.03,
      expenseDate: new Date('2026-03-06T00:00:00.000Z'),
      supplier: 'Shell',
      notes: 'Receipt still needed.',
      bankTransactionId: tx3.id,
      eventId: eventA.id,
      businessUsePercent: 100
    }
  });

  await prisma.expense.upsert({
    where: { id: 'exp-c' },
    update: {},
    create: {
      id: 'exp-c',
      organizationId: org.id,
      description: 'Public liability insurance',
      category: ExpenseCategory.INSURANCE,
      source: ExpenseSource.MANUAL,
      amount: 180,
      taxAmount: 0,
      expenseDate: new Date('2026-02-20T00:00:00.000Z'),
      supplier: 'Hiscox',
      notes: 'Annual premium.',
      businessUsePercent: 100
    }
  });

  await prisma.expense.upsert({
    where: { id: 'exp-d' },
    update: {},
    create: {
      id: 'exp-d',
      organizationId: org.id,
      eventId: eventB.id,
      clientAccountId: clientB.id,
      description: 'Assistant host support for corporate launch',
      category: ExpenseCategory.SUBCONTRACTOR,
      source: ExpenseSource.MANUAL,
      amount: 250,
      taxAmount: 0,
      expenseDate: new Date('2026-03-04T00:00:00.000Z'),
      supplier: 'Freelance Host Support',
      notes: 'Direct cost allocated to event profit tracking.',
      businessUsePercent: 100
    }
  });

  await prisma.expense.upsert({
    where: { id: 'exp-e' },
    update: {},
    create: {
      id: 'exp-e',
      organizationId: org.id,
      eventId: eventA.id,
      clientAccountId: clientA.id,
      description: 'Early load-in parking for wedding venue',
      category: ExpenseCategory.TRAVEL,
      source: ExpenseSource.MANUAL,
      amount: 18,
      taxAmount: 0,
      expenseDate: new Date('2026-03-02T00:00:00.000Z'),
      supplier: 'Liverpool Waterfront Parking',
      notes: 'Direct cost allocated to wedding booking.',
      businessUsePercent: 100
    }
  });

  const performerA = await prisma.performer.upsert({
    where: { id: 'perf-a' },
    update: {},
    create: {
      id: 'perf-a',
      organizationId: org.id,
      displayName: 'Jake Mercer',
      stageName: 'DJ Jake',
      role: PerformerRole.DJ,
      email: 'jake@example.com',
      phone: '07700 900234',
      defaultFee: 250,
      defaultTravelFee: 25,
      bankAccountName: 'Jake Mercer',
      bankName: 'Monzo',
      bankAccountLast4: '4419',
      bankSortCodeLast2: '22',
      payoutReference: 'JAKE-DJ',
      payoutMethod: 'manual_bank_transfer',
      canUseOpenBankingPayout: false,
      reminderPhone: '07700 900999',
      reminderEmail: email,
      notes: 'Can cover late set extensions.'
    }
  });

  const performerB = await prisma.performer.upsert({
    where: { id: 'perf-b' },
    update: {},
    create: {
      id: 'perf-b',
      organizationId: org.id,
      displayName: 'Sophie Vale',
      stageName: 'Sax by Sophie',
      role: PerformerRole.SAX,
      email: 'sophie@example.com',
      phone: '07700 900345',
      defaultFee: 180,
      defaultTravelFee: 20,
      bankAccountName: 'Sophie Vale',
      bankName: 'Starling',
      bankAccountLast4: '8821',
      bankSortCodeLast2: '55',
      payoutReference: 'SOPHIE-SAX',
      payoutMethod: 'open_banking_prepare',
      canUseOpenBankingPayout: true,
      reminderPhone: '07700 900999',
      reminderEmail: email,
      notes: 'Needs parking details before venue arrival.'
    }
  });

  await prisma.eventPerformerAssignment.upsert({
    where: { eventId_performerId: { eventId: eventA.id, performerId: performerA.id } },
    update: {},
    create: {
      organizationId: org.id,
      eventId: eventA.id,
      performerId: performerA.id,
      roleLabel: 'Evening DJ',
      callTime: '17:30',
      performanceStart: '19:00',
      performanceEnd: '23:30',
      loadInNotes: 'Use rear loading bay. Keep uplighting flight case separate.',
      sharedNotes: 'Client wants first dance cued exactly at 19:45. Smart black attire.',
      locationSnapshot: 'Liverpool Waterfront Suite',
      fee: 250,
      travelFee: 25,
      payoutDueDate: new Date('2026-06-21T10:00:00.000Z'),
      payoutStatus: PerformerPayoutStatus.READY,
      payoutReminderChannel: ReminderChannel.SMS,
      packSentAt: new Date('2026-06-15T09:00:00.000Z'),
      bankPaymentPrepared: false
    }
  });

  await prisma.eventPerformerAssignment.upsert({
    where: { eventId_performerId: { eventId: eventB.id, performerId: performerB.id } },
    update: {},
    create: {
      organizationId: org.id,
      eventId: eventB.id,
      performerId: performerB.id,
      roleLabel: 'Roaming sax',
      callTime: '16:00',
      performanceStart: '18:30',
      performanceEnd: '21:30',
      loadInNotes: 'Check in with production manager on side entrance.',
      sharedNotes: 'Corporate black tie. Set list to stay upbeat and modern.',
      locationSnapshot: 'Manchester Exchange Hall',
      fee: 180,
      travelFee: 20,
      payoutDueDate: new Date('2026-07-02T12:00:00.000Z'),
      payoutStatus: PerformerPayoutStatus.APPROVED,
      payoutReminderChannel: ReminderChannel.EMAIL,
      payoutApprovedAt: new Date('2026-06-28T09:00:00.000Z'),
      packSentAt: new Date('2026-06-24T08:30:00.000Z'),
      bankPaymentPrepared: true
    }
  });

  await prisma.emailTemplate.deleteMany({ where: { organizationId: org.id } });
  await prisma.emailTemplate.createMany({
    data: [
      {
        organizationId: org.id,
        name: 'New enquiry auto-reply',
        triggerType: 'enquiry.created',
        subject: 'Thanks for your enquiry, {{client_name}}',
        body: 'Thanks for getting in touch — we will confirm availability shortly.',
        isEnabled: true
      },
      {
        organizationId: org.id,
        name: 'Invoice reminder',
        triggerType: 'invoice.overdue',
        subject: 'Friendly reminder for invoice {{invoice_number}}',
        body: 'Just a quick reminder that your booking invoice still has a balance due.',
        isEnabled: true
      }
    ]
  });

  await prisma.automationRule.deleteMany({ where: { organizationId: org.id } });
  await prisma.automationRule.createMany({
    data: [
      {
        organizationId: org.id,
        name: 'Send enquiry acknowledgement',
        triggerType: 'enquiry.created',
        actionType: 'send_email',
        isEnabled: true
      },
      {
        organizationId: org.id,
        name: 'Invoice reminder 3 days before due date',
        triggerType: 'invoice.due_soon',
        actionType: 'send_email',
        isEnabled: true
      },
      {
        organizationId: org.id,
        name: 'Performer payout reminder',
        triggerType: 'performer_payout.due',
        actionType: 'send_sms_to_owner',
        isEnabled: true
      }
    ]
  });

  const form = await prisma.bookingForm.upsert({
    where: { id: 'form-a' },
    update: {},
    create: {
      id: 'form-a',
      organizationId: org.id,
      name: 'Website booking form',
      slug: 'book-now',
      isPublished: true,
      successMessage: 'Thanks — we\'ll confirm availability within one working day.'
    }
  });

  await prisma.bookingFormSubmission.deleteMany({ where: { organizationId: org.id } });
  await prisma.bookingFormSubmission.createMany({
    data: [
      {
        organizationId: org.id,
        bookingFormId: form.id,
        contactName: 'Harriet Mason',
        email: 'harriet@example.com',
        phone: '07888 010101',
        eventType: '40th Birthday',
        eventDate: new Date('2026-08-14T00:00:00.000Z'),
        message: 'Looking for DJ + sax package in Cheshire.'
      },
      {
        organizationId: org.id,
        bookingFormId: form.id,
        contactName: 'Thomas Green',
        email: 'tom@green.test',
        eventType: 'Company summer party',
        eventDate: new Date('2026-07-18T00:00:00.000Z'),
        message: 'Need MC and evening entertainment.'
      }
    ]
  });

  await prisma.availabilityBlock.deleteMany({ where: { organizationId: org.id } });
  await prisma.availabilityBlock.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Travel / setup hold',
        startsAt: new Date('2026-06-20T16:30:00.000Z'),
        endsAt: new Date('2026-06-20T18:30:00.000Z'),
        blockType: 'travel',
        notes: 'Wedding setup window'
      },
      {
        organizationId: org.id,
        title: 'Hold for awards night',
        startsAt: new Date('2026-07-01T15:00:00.000Z'),
        endsAt: new Date('2026-07-01T16:30:00.000Z'),
        blockType: 'hold',
        notes: 'Venue access pending'
      }
    ]
  });

  await prisma.taxPeriod.upsert({
    where: { id: 'tax-2025-26' },
    update: {},
    create: {
      id: 'tax-2025-26',
      organizationId: org.id,
      label: '2025/26',
      startsOn: new Date('2025-04-06T00:00:00.000Z'),
      endsOn: new Date('2026-04-05T23:59:59.000Z'),
      status: TaxYearStatus.OPEN,
      notes: 'Starter self-employed tax dashboard period.'
    }
  });

  console.log(`Seeded demo admin: ${email}`);
  console.log(`Client portal token demo: ${clientA.portalToken}`);
  console.log(`Booking form path demo: /booking-form`);
  console.log(`Client portal path demo: /portal/${clientA.portalToken}`);
  console.log(`Tax dashboard path demo: /tax`);
  console.log(`Banking dashboard path demo: /banking`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
