import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email()
  .transform((e) => e.toLowerCase());

export const SignupSchema = z.object({
  username: email,
  password: z.string().min(6),
  name: z.string().trim().min(1),
});

export const SigninSchema = z.object({
  username: email,
  password: z.string().min(1),
});

export const VerifyOtpSchema = z.object({
  username: email,
  code: z.string().regex(/^\d{6}$/),
});

export const ResendOtpSchema = z.object({ username: email });

// Action metadata is a flat map of template strings, e.g. { email: '{email}' }.
const MetadataSchema = z.record(z.string());

export const ZapCreateSchema = z.object({
  availableTriggerId: z.string(),
  triggerMetadata: MetadataSchema.optional(),
  actions: z.array(
    z.object({
      availableActionId: z.string(),
      actionMetadata: MetadataSchema.optional(),
    }),
  ),
});

export const UpdateProfileSchema = z.object({ name: z.string().trim().min(1).max(80) });

export const ChangeEmailSchema = z.object({ email });

export const EmailCodeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(128),
});
