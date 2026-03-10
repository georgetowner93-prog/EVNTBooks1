import { authenticator } from 'otplib';

authenticator.options = {
  window: 1,
  step: 30
};

export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export function buildOtpAuthUri(email: string, secret: string, issuer: string) {
  return authenticator.keyuri(email, issuer, secret);
}

export function verifyTotpToken(secret: string, token: string) {
  return authenticator.verify({ token: token.replace(/\s+/g, ''), secret });
}
