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

// An empty name means "no custom title", so the zap shows its step names.
const zapName = z
  .string()
  .trim()
  .max(80)
  .transform((n) => n || null);

export const ZapCreateSchema = z.object({
  name: zapName.optional(),
  availableTriggerId: z.string(),
  triggerMetadata: MetadataSchema.optional(),
  actions: z
    .array(
      z.object({
        availableActionId: z.string(),
        actionMetadata: MetadataSchema.optional(),
      }),
    )
    .min(1),
});

/** Renames a zap, turns it on or off, or both. */
export const ZapUpdateSchema = z
  .object({ name: zapName.optional(), enabled: z.boolean().optional() })
  .refine((v) => v.name !== undefined || v.enabled !== undefined);

export const UpdateProfileSchema = z.object({ name: z.string().trim().min(1).max(80) });

export const ChangeEmailSchema = z.object({ email });

export const EmailCodeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(128),
});

export const ConnectionCreateSchema = z.object({
  connectorId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  values: z.record(z.string().trim().min(1).max(500)),
});
