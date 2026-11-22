import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { prismaClient } from '../db';
import { authMiddleware } from '../middleware/auth';
import {
  AvatarSchema,
  ChangeEmailSchema,
  ChangePasswordSchema,
  EmailCodeSchema,
  UpdateProfileSchema,
} from '../schemas';
import { canResendOtp, issueOtp, verifyOtp } from '../services/otp';
import { revokeOtherSessions } from '../services/session';

export const profileRouter = Router();
profileRouter.use(authMiddleware);

const publicProfile = { name: true, email: true, avatar: true } as const;

const currentUser = (id: number) => prismaClient.user.findUniqueOrThrow({ where: { id } });

profileRouter.get('/', async (req, res) => {
  const user = await currentUser(req.userId!);
  // hasPassword lets the UI offer "set" vs "change" password for OAuth-only accounts.
  const { name, email, avatar } = user;
  res.json({ profile: { name, email, avatar, hasPassword: !!user.password } });
});

profileRouter.patch('/', async (req, res) => {
  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Name must be 1 to 80 characters' });
    return;
  }
  const user = await prismaClient.user.update({
    where: { id: req.userId },
    data: { name: parsed.data.name },
    select: publicProfile,
  });
  res.json({ user });
});

// Sets or clears the profile photo. Only the image type and size are checked; it is shown to its owner only.
profileRouter.put('/avatar', async (req, res) => {
  const parsed = AvatarSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Use a PNG, JPEG or WebP image of at most 45 KB' });
    return;
  }
  const user = await prismaClient.user.update({
    where: { id: req.userId },
    data: { avatar: parsed.data.avatar },
    select: publicProfile,
  });
  res.json({ user });
});

// Email change, step 1: send a code to the new address.
profileRouter.post('/email', async (req, res) => {
  const parsed = ChangeEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Enter a valid email address' });
    return;
  }
  const user = await currentUser(req.userId!);
  const { email } = parsed.data;
  if (email === user.email) {
    res.status(400).json({ message: 'That is already your email' });
    return;
  }
  if (await prismaClient.user.findUnique({ where: { email } })) {
    res.status(400).json({ message: 'That email is already in use' });
    return;
  }
  if ((await canResendOtp(user.id, 'email_change')) === 'cooldown') {
    res.status(429).json({ message: 'Please wait a minute before requesting another code.' });
    return;
  }
  await issueOtp(user, 'email_change', email);
  res.json({ otpRequired: true, email });
});

// Email change, step 2: a correct code proves ownership and swaps the address.
profileRouter.post('/email/verify', async (req, res) => {
  const parsed = EmailCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Enter the 6-digit code' });
    return;
  }
  const { result, email } = await verifyOtp(req.userId!, parsed.data.code, 'email_change');
  if (result !== 'ok' || !email) {
    const messages = {
      invalid: 'Incorrect code. Check your new inbox and try again.',
      expired: 'This code has expired. Request a new one.',
      locked: 'Too many attempts. Request a new code.',
      ok: 'This code has expired. Request a new one.',
    };
    res.status(400).json({ message: messages[result] });
    return;
  }
  // Re-check: the address may have been taken while the code was pending.
  if (await prismaClient.user.findUnique({ where: { email } })) {
    res.status(400).json({ message: 'That email is already in use' });
    return;
  }
  const user = await prismaClient.user.update({
    where: { id: req.userId },
    data: { email, emailVerified: true },
    select: publicProfile,
  });
  res.json({ user });
});

profileRouter.post('/password', async (req, res) => {
  const parsed = ChangePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'New password must be at least 6 characters' });
    return;
  }
  const user = await currentUser(req.userId!);
  const { currentPassword, newPassword } = parsed.data;
  // OAuth-only accounts may set a first password; everyone else must prove the current one.
  if (
    user.password &&
    !(currentPassword && (await bcrypt.compare(currentPassword, user.password)))
  ) {
    res.status(400).json({ message: 'Current password is incorrect' });
    return;
  }
  await prismaClient.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });
  await revokeOtherSessions(req, user.id);
  res.json({ ok: true });
});
