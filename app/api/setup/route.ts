import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function POST(request: Request) {
  try {
    const existingPlatformAdmin = await prisma.user.findFirst({
      where: { isPlatformAdmin: true },
      select: { id: true },
    });

    if (existingPlatformAdmin) {
      return NextResponse.json(
        { error: 'Setup has already been completed.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const platformName = String(body.platformName || 'EVNTBooks').trim();
    const companyName = String(body.companyName || '').trim();
    const adminName = String(body.adminName || '').trim();
    const adminEmail = String(body.adminEmail || '').trim().toLowerCase();
    const adminPassword = String(body.adminPassword || '');

    if (!companyName || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (adminPassword.length < 10) {
      return NextResponse.json(
        { error: 'Password must be at least 10 characters.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with that email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await argon2.hash(adminPassword);

    const nameParts = adminName.split(' ').filter(Boolean);
    const firstName = nameParts[0] || adminName;
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    const baseSlug = slugify(companyName) || 'company';
    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.organization.findFirst({
        where: { slug },
        select: { id: true },
      })
    ) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug,
          email: adminEmail,
          ownerEmail: adminEmail,
          timezone: 'Europe/London',
          currency: 'GBP',
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: adminEmail,
          firstName,
          lastName,
          role: UserRole.ADMIN,
          passwordHash,
          isActive: true,
          isPlatformAdmin: true,
          twoFactorEnabled: false,
        },
      });

      return { organization, user };
    });

    return NextResponse.json({
      ok: true,
      message: `${platformName} setup complete`,
      organizationId: result.organization.id,
      userId: result.user.id,
    });
  } catch (error) {
    console.error('Setup route error:', error);
    return NextResponse.json(
      { error: 'Unexpected setup error.' },
      { status: 500 }
    );
  }
}