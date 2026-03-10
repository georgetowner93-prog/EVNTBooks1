'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClientAccountType, EnquirySource, EnquiryStatus, EventStatus, InvoiceStatus, InvoiceType, QuoteStatus, ContractStatus } from '@prisma/client';
import { requireSession, clearSessionCookie } from '@/lib/auth/session';
import { encryptText } from '@/lib/auth/crypto';
import { generateRecoveryCodes, hashRecoveryCode } from '@/lib/auth/password';
import { buildOtpAuthUri, generateTotpSecret, verifyTotpToken } from '@/lib/auth/totp';
import QRCode from 'qrcode';

async function getOrg() {
  const session = await requireSession();
  if (session.isPlatformAdmin || !session.orgId) throw new Error('Switch into a tenant workspace first.');
  const org = await prisma.organization.findUnique({ where: { id: session.orgId } });
  if (!org) throw new Error('Organization not found.');
  if (org.status !== 'ACTIVE') throw new Error('This tenant is suspended.');
  return org;
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}

export async function createCompanyAction(formData: FormData) {
  const session = await requireSession();
  if (!session.isPlatformAdmin) throw new Error('Forbidden');

  const companyName = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const ownerEmail = String(formData.get('ownerEmail') || '').trim().toLowerCase();
  const ownerFirstName = String(formData.get('ownerFirstName') || '').trim() || 'Owner';
  const ownerLastName = String(formData.get('ownerLastName') || '').trim() || 'User';
  const ownerPassword = String(formData.get('ownerPassword') || '').trim();

  if (!companyName || !slug || !ownerEmail || !ownerPassword) throw new Error('Company, slug, owner email and owner password are required.');

  const passwordHash = await (await import('@/lib/auth/password')).hashPassword(ownerPassword);

  await prisma.organization.create({
    data: {
      name: companyName,
      slug,
      email: ownerEmail,
      status: 'ACTIVE',
      ownerEmail,
      users: {
        create: {
          email: ownerEmail,
          firstName: ownerFirstName,
          lastName: ownerLastName,
          role: 'ADMIN',
          passwordHash,
          isActive: true
        }
      }
    }
  });

  redirect('/admin');
}

export async function suspendCompanyAction(formData: FormData) {
  const session = await requireSession();
  if (!session.isPlatformAdmin) throw new Error('Forbidden');
  const organizationId = String(formData.get('organizationId') || '');
  if (!organizationId) throw new Error('Organization is required');
  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: 'SUSPENDED', suspendedAt: new Date() }
  });
  redirect('/admin');
}

export async function activateCompanyAction(formData: FormData) {
  const session = await requireSession();
  if (!session.isPlatformAdmin) throw new Error('Forbidden');
  const organizationId = String(formData.get('organizationId') || '');
  if (!organizationId) throw new Error('Organization is required');
  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: 'ACTIVE', suspendedAt: null }
  });
  redirect('/admin');
}

export async function createClient(formData: FormData) {
  await requireSession();
  const org = await getOrg();
  const name = String(formData.get('displayName') || '').trim();
  if (!name) throw new Error('Display name is required');

  await prisma.clientAccount.create({
    data: {
      organizationId: org.id,
      type: (String(formData.get('type') || 'INDIVIDUAL') as ClientAccountType),
      displayName: name,
      billingEmail: String(formData.get('billingEmail') || '').trim() || null,
      billingPhone: String(formData.get('billingPhone') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null
    }
  });

  redirect('/clients');
}

export async function createEnquiry(formData: FormData) {
  await requireSession();
  const org = await getOrg();
  await prisma.enquiry.create({
    data: {
      organizationId: org.id,
      clientAccountId: String(formData.get('clientAccountId') || '') || null,
      source: (String(formData.get('source') || 'MANUAL') as EnquirySource),
      status: (String(formData.get('status') || 'NEW') as EnquiryStatus),
      eventType: String(formData.get('eventType') || '').trim() || null,
      eventDate: formData.get('eventDate') ? new Date(String(formData.get('eventDate'))) : null,
      guestCount: formData.get('guestCount') ? Number(formData.get('guestCount')) : null,
      budgetMax: formData.get('budgetMax') ? Number(formData.get('budgetMax')) : null,
      message: String(formData.get('message') || '').trim() || null
    }
  });

  redirect('/enquiries');
}

export async function createEvent(formData: FormData) {
  await requireSession();
  const org = await getOrg();
  const clientAccountId = String(formData.get('clientAccountId') || '');
  if (!clientAccountId) throw new Error('Client is required');

  const totalPrice = Number(formData.get('totalPrice') || 0);
  const amountPaid = Number(formData.get('amountPaid') || 0);

  await prisma.event.create({
    data: {
      organizationId: org.id,
      clientAccountId,
      title: String(formData.get('title') || '').trim() || 'Untitled event',
      eventType: String(formData.get('eventType') || '').trim() || null,
      status: (String(formData.get('status') || 'TENTATIVE') as EventStatus),
      eventDate: new Date(String(formData.get('eventDate'))),
      startTime: String(formData.get('startTime') || '').trim() || null,
      endTime: String(formData.get('endTime') || '').trim() || null,
      guestCount: formData.get('guestCount') ? Number(formData.get('guestCount')) : null,
      totalPrice,
      balanceDue: Math.max(totalPrice - amountPaid, 0),
      internalNotes: String(formData.get('internalNotes') || '').trim() || null
    }
  });

  redirect('/events');
}

export async function createInvoice(formData: FormData) {
  await requireSession();
  const org = await getOrg();
  const total = Number(formData.get('total') || 0);
  await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientAccountId: String(formData.get('clientAccountId') || ''),
      eventId: String(formData.get('eventId') || '') || null,
      invoiceNumber: String(formData.get('invoiceNumber') || '').trim(),
      type: (String(formData.get('type') || 'STANDARD') as InvoiceType),
      status: (String(formData.get('status') || 'DRAFT') as InvoiceStatus),
      issueDate: new Date(String(formData.get('issueDate'))),
      dueDate: new Date(String(formData.get('dueDate'))),
      total,
      amountDue: total,
      notes: String(formData.get('notes') || '').trim() || null
    }
  });

  redirect('/invoices');
}

export async function createQuote(formData: FormData) {
  await requireSession();
  const org = await getOrg();
  await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientAccountId: String(formData.get('clientAccountId') || ''),
      eventId: String(formData.get('eventId') || '') || null,
      quoteNumber: String(formData.get('quoteNumber') || '').trim(),
      status: (String(formData.get('status') || 'DRAFT') as QuoteStatus),
      validUntil: formData.get('validUntil') ? new Date(String(formData.get('validUntil'))) : null,
      total: Number(formData.get('total') || 0),
      notes: String(formData.get('notes') || '').trim() || null
    }
  });
  redirect('/quotes');
}

export async function createContract(formData: FormData) {
  await requireSession();
  const org = await getOrg();
  await prisma.contract.create({
    data: {
      organizationId: org.id,
      clientAccountId: String(formData.get('clientAccountId') || ''),
      eventId: String(formData.get('eventId') || '') || null,
      contractNumber: String(formData.get('contractNumber') || '').trim(),
      status: (String(formData.get('status') || 'DRAFT') as ContractStatus),
      title: String(formData.get('title') || '').trim(),
      body: String(formData.get('body') || '').trim()
    }
  });
  redirect('/contracts');
}

export async function prepareTwoFactorSetup() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) throw new Error('User not found');

  const secret = generateTotpSecret();
  const otpauth = buildOtpAuthUri(user.email, secret, process.env.APP_NAME || 'Giggio Lite');
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    otpauth,
    qrCodeDataUrl
  };
}

export async function enableTwoFactorAction(prevState: { error: string; recoveryCodes: string[] }, formData: FormData) {
  const session = await requireSession();
  const secret = String(formData.get('secret') || '');
  const code = String(formData.get('code') || '').trim();
  if (!verifyTotpToken(secret, code)) {
    return { error: 'Invalid authenticator code.', recoveryCodes: [] };
  }

  const recoveryCodes = generateRecoveryCodes();

  await prisma.user.update({
    where: { id: session.sub },
    data: {
      twoFactorEnabled: true,
      twoFactorSecretEnc: encryptText(secret),
      twoFactorRecoveryHash: recoveryCodes.map(hashRecoveryCode)
    }
  });

  return { error: '', recoveryCodes };
}


export async function disableTwoFactorAction() {
  const session = await requireSession();
  await prisma.user.update({
    where: { id: session.sub },
    data: {
      twoFactorEnabled: false,
      twoFactorSecretEnc: null,
      twoFactorRecoveryHash: []
    }
  });
  redirect('/security');
}
