import { sendMail } from '@integrix/mailer';
import { OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from '../config';
import { prismaClient } from '../db';
import { generateOtp, safeEqual, sha256 } from '../lib/crypto';

export type OtpPurpose = 'auth' | 'email_change';
export type OtpResult = 'ok' | 'invalid' | 'expired' | 'locked';

interface OtpUser {
  id: number;
  email: string;
  name: string;
}

// Bound to the user id so a hash can't be replayed for another account.
const hashCode = (userId: number, code: string) => sha256(`${userId}:${code}`);

const latestActive = (userId: number, purpose: OtpPurpose) =>
  prismaClient.otpCode.findFirst({
    where: { userId, purpose, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

const subjects: Record<OtpPurpose, (code: string) => string> = {
  auth: (code) => `${code} is your Integrix verification code`,
  email_change: (code) => `${code} confirms your new Integrix email`,
};

/** Replaces any pending code of this purpose and emails a new one (to `to` for email changes). */
export async function issueOtp(user: OtpUser, purpose: OtpPurpose = 'auth', to = user.email) {
  const code = generateOtp();
  await prismaClient.$transaction([
    prismaClient.otpCode.deleteMany({ where: { userId: user.id, purpose } }),
    prismaClient.otpCode.create({
      data: {
        userId: user.id,
        purpose,
        email: purpose === 'email_change' ? to : null,
        codeHash: hashCode(user.id, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    }),
  ]);
  await sendMail({
    to,
    subject: subjects[purpose](code),
    text: `Hi ${user.name},\n\nYour Integrix verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
  });
}

/** Checks a code; on success consumes it and returns the target email (for email changes). */
export async function verifyOtp(
  userId: number,
  code: string,
  purpose: OtpPurpose = 'auth',
): Promise<{ result: OtpResult; email?: string | null }> {
  const otp = await latestActive(userId, purpose);
  if (!otp) return { result: 'expired' };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { result: 'locked' };
  if (!safeEqual(otp.codeHash, hashCode(userId, code))) {
    await prismaClient.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { result: 'invalid' };
  }
  await prismaClient.otpCode.deleteMany({ where: { userId, purpose } });
  return { result: 'ok', email: otp.email };
}

/** Resend is allowed only while a code is pending (password already checked) and off cooldown. */
export async function canResendOtp(
  userId: number,
  purpose: OtpPurpose = 'auth',
): Promise<'ok' | 'none' | 'cooldown'> {
  const otp = await latestActive(userId, purpose);
  if (!otp) return 'none';
  return Date.now() - otp.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS ? 'cooldown' : 'ok';
}
