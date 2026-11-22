import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import { ResendOtpSchema, SigninSchema, SignupSchema, VerifyOtpSchema } from '../schemas';
import { canResendOtp, issueOtp, verifyOtp, type OtpResult } from '../services/otp';
import { endSession, startSession } from '../services/session';

export const userRouter = Router();

const otpErrors: Record<Exclude<OtpResult, 'ok'>, string> = {
  invalid: 'Incorrect code. Check your email and try again.',
  expired: 'This code has expired. Request a new one.',
  locked: 'Too many attempts. Request a new code.',
};

// Step 1 of signup: create the (unverified) account and email a code.
userRouter.post('/signup', async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const { username: email, password, name } = parsed.data;
  if (await prismaClient.user.findUnique({ where: { email } })) {
    res.status(400).json({ message: 'An account with this email already exists. Log in instead.' });
    return;
  }

  const user = await prismaClient.user.create({
    data: { email, name, password: await bcrypt.hash(password, 10) },
  });
  await issueOtp(user);
  res.json({ otpRequired: true, email });
});

// Step 1 of login: check the password, then email a code.
userRouter.post('/signin', async (req, res) => {
  const parsed = SigninSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const user = await prismaClient.user.findUnique({ where: { email: parsed.data.username } });
  // One message for unknown user, OAuth-only account and bad password (no account enumeration).
  if (!user?.password || !(await bcrypt.compare(parsed.data.password, user.password))) {
    res.status(400).json({ message: 'Invalid email or password' });
    return;
  }
  await issueOtp(user);
  res.json({ otpRequired: true, email: user.email });
});

// Step 2 of signup/login: a correct code verifies the email and starts a 7-day session.
userRouter.post('/verify-otp', async (req, res) => {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Enter the 6-digit code' });
    return;
  }

  const user = await prismaClient.user.findUnique({ where: { email: parsed.data.username } });
  const { result } = user
    ? await verifyOtp(user.id, parsed.data.code)
    : { result: 'expired' as const };
  if (!user || result !== 'ok') {
    res.status(400).json({ message: otpErrors[result === 'ok' ? 'expired' : result] });
    return;
  }

  if (!user.emailVerified) {
    await prismaClient.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  }
  await startSession(res, user.id);
  res.json({ user: { name: user.name, email: user.email, avatar: user.avatar } });
});

userRouter.post('/resend-otp', async (req, res) => {
  const parsed = ResendOtpSchema.safeParse(req.body);
  const user = parsed.success
    ? await prismaClient.user.findUnique({ where: { email: parsed.data.username } })
    : null;
  const status = user ? await canResendOtp(user.id) : 'none';

  if (status === 'cooldown') {
    res.status(429).json({ message: 'Please wait a minute before requesting another code.' });
    return;
  }
  if (status === 'none' || !user) {
    res.status(400).json({ message: 'Your code expired. Go back and sign in again.' });
    return;
  }
  await issueOtp(user);
  res.json({ ok: true });
});

userRouter.post('/logout', async (req, res) => {
  await endSession(req, res);
  res.json({ ok: true });
});

userRouter.get('/', authMiddleware, async (req, res) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.userId },
    select: { name: true, email: true, avatar: true },
  });
  res.json({ user });
});
