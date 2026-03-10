import { prisma } from '@/lib/prisma';
import { verifyPassword, hashRecoveryCode } from './password';
import { decryptText } from './crypto';
import { verifyTotpToken } from './totp';
import { LOCKOUT_MINUTES, MAX_FAILED_LOGINS } from './constants';

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export async function attemptLogin(email: string, password: string, twoFactorCode?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { organization: true }
  });

  if (!user || !user.isActive) {
    return { ok: false as const, message: 'Invalid email or password.' };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false as const, message: 'Account temporarily locked. Try again later.' };
  }

  const passwordOk = await verifyPassword(user.passwordHash, password);
  if (!passwordOk) {
    const nextAttempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: nextAttempts,
        lockedUntil: nextAttempts >= MAX_FAILED_LOGINS ? addMinutes(new Date(), LOCKOUT_MINUTES) : null
      }
    });
    return { ok: false as const, message: 'Invalid email or password.' };
  }

  if (user.twoFactorEnabled) {
    const secretEnc = user.twoFactorSecretEnc;
    if (!secretEnc) {
      return { ok: false as const, message: '2FA is enabled but not configured correctly.' };
    }

    const code = (twoFactorCode || '').trim();
    if (!code) {
      return { ok: false as const, message: 'Two-factor code is required.' };
    }

    const secret = decryptText(secretEnc);
    const recoveryHashes = Array.isArray(user.twoFactorRecoveryHash) ? (user.twoFactorRecoveryHash as string[]) : [];
    const recoveryHash = hashRecoveryCode(code.toUpperCase());
    const usingRecoveryCode = recoveryHashes.includes(recoveryHash);
    const totpOk = verifyTotpToken(secret, code);

    if (!totpOk && !usingRecoveryCode) {
      const nextAttempts = user.failedLoginAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextAttempts,
          lockedUntil: nextAttempts >= MAX_FAILED_LOGINS ? addMinutes(new Date(), LOCKOUT_MINUTES) : null
        }
      });
      return { ok: false as const, message: 'Invalid two-factor code.' };
    }

    if (usingRecoveryCode) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorRecoveryHash: recoveryHashes.filter((hash) => hash !== recoveryHash)
        }
      });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  });

  return {
    ok: true as const,
    user: {
      id: user.id,
      orgId: user.organizationId ?? null,
      role: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      isPlatformAdmin: user.isPlatformAdmin
    }
  };
}
