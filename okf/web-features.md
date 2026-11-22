---
type: Module
title: Web features and helpers
description: Header and footer, auth form, zap builder, API client and auth store.
resource: ../apps/web/
---

# Feature components, hooks and lib

- `lib/api.ts` is the only place that calls the backend: `api<T>(path, { method, body, signal })` sends JSON with `credentials: 'include'` (the session cookie), throws `ApiError` with the server `message`, and emits an unauthorized event on 401.
- `lib/session.ts` is the single session store. `useSession()` returns `loading`, `authenticated` (with `user`) or `unauthenticated` from one `/auth/session` request, shared by every component. `refreshSession()` runs after login and `signOut()` on logout. Render nothing while `loading`.
- `lib/links.ts` holds shared URLs. `links.docs` (`/docs`) and `links.apiReference` (`/docs#api`) are in-app, the rest point to GitHub.
- `lib/config.ts` reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_HOOKS_URL` (inlined at build) and builds webhook URLs. `lib/types.ts` mirrors API response shapes.
- `hooks/use-api.ts` is an abortable GET hook that returns `{ data, error, loading, reload }`. `reload()` refetches while keeping the current data on screen; call it after a mutation.
- `components/app/`: `AppShell` (desktop sidebar, mobile drawer), `AppSidebar` (Create button, nav with `match` rules, resource links) and `UserMenu` (avatar, theme, home and log-out). Add app routes to the `nav` array.
- `components/marketing/`: `SiteHeader` (section anchors, auth-aware buttons) and `SiteFooter` (link columns, legal bar, wordmark). Shared external URLs live in `lib/links.ts`.
- `components/settings/`: `SettingsCard` (one form per card, with a footer hint and save action) and `profile-forms.tsx` (`NameForm`, `EmailForm` with the code step, `PasswordForm`). Forms call `refreshSession()` after changes so the sidebar updates. The page is `app/(app)/settings`.
- `components/auth-form.tsx` handles login and signup in two steps: credentials (plus a Google button when configured), then the emailed OTP with resend cooldown. Its field names (`username`, `password`, `name`, `code`) match the API's zod schemas.
- `components/zap/`: `zap-card` (dashboard), `step-node` and `step-picker` (builder), and `integration-icon`. `zap-title.ts` holds `zapTitle` (custom name, else the step chain) and `stepsTitle`. `sample-payload.ts` builds an example webhook body from a zap's `{placeholders}` (same syntax as the worker parser) and `webhookCurl()` formats the curl for the zap page and `/docs`. `step-details-dialog.tsx` shows an action's full settings when a step on the zap page is clicked, labelled from `action-fields.ts`. `zap-actions.tsx` is the Rename and Delete menu with its dialogs, used on the dashboard cards (`onChange` reloads the list) and the zap page (rename reloads, delete returns to the dashboard). It also holds three registries keyed by connector id:
  - `action-fields.ts`: the per-action form fields.
  - `integration-catalog.ts`: name, kind and description, used by the Integrations page and `/docs`.
  - `zap-templates.ts`: sample zaps, plus `templateSteps()` for the builder prefill (it swaps fields equal to `OWNER_EMAIL` for the signed-in user's email, so a sample never publishes an undeliverable address) and `templateRequestBody()` for the API snippet. `zap-templates.test.ts` keeps samples in step with `action-fields.ts`.

  To add a connector, follow [connectors.md](connectors.md).

- Verify with `bun run typecheck`. With the stack running, create a zap end to end and check the dashboard and detail pages.
