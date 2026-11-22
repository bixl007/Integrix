---
type: Module
title: Web features and helpers
description: Header and footer, auth form, zap builder, API client and auth store.
resource: ../apps/web/
---

# Feature components, hooks and lib

- `lib/api.ts` is the only place that calls the backend: `api<T>(path, { method, body, signal })` sends JSON with `credentials: 'include'` (the session cookie), throws `ApiError` with the server `message`, and emits an unauthorized event on 401.
- `lib/session.ts` is the single session store. `useSession()` returns `loading`, `authenticated` (with `user`) or `unauthenticated` from one `/auth/session` request, shared by every component. `refreshSession()` runs after login and `signOut()` on logout. Render nothing while `loading`.
- `lib/config.ts` reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_HOOKS_URL` (inlined at build) and builds webhook URLs. `lib/types.ts` mirrors API response shapes.
- `hooks/use-api.ts` is an abortable GET hook that returns `{ data, error, loading }`.
- `components/app/`: `AppShell` (desktop sidebar, mobile drawer), `AppSidebar` (Create button, nav with `match` rules, resource links) and `UserMenu` (avatar, theme, home and log-out). Add app routes to the `nav` array.
- `components/marketing/`: `SiteHeader` (section anchors, auth-aware buttons) and `SiteFooter` (link columns, legal bar, wordmark). Shared external URLs live in `lib/links.ts`.
- `components/settings/`: `SettingsCard` (one form per card, with a footer hint and save action) and `profile-forms.tsx` (`NameForm`, `EmailForm` with the code step, `PasswordForm`). Forms call `refreshSession()` after changes so the sidebar updates. The page is `app/(app)/settings`.
- `components/auth-form.tsx` handles login and signup in two steps: credentials (plus a Google button when configured), then the emailed OTP with resend cooldown. Its field names (`username`, `password`, `name`, `code`) match the API's zod schemas.
- `components/zap/`: `zap-card` (dashboard), `step-node` and `step-picker` (builder), `integration-icon`, and `action-fields.ts`, the per-action form registry keyed by `AvailableAction.id`. A new action needs an entry there and a handler in the worker.
- Verify with `bun run typecheck`. With the stack running, create a zap end to end and check the dashboard and detail pages.
