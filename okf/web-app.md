---
type: Module
title: Web routes and layouts
description: Route groups, the root layout, the auth guard and page data flow.
resource: ../apps/web/app/
---

# Next.js App Router

- `layout.tsx` loads the Geist fonts through `next/font` (self-hosted at build time) and wraps `Providers` (next-themes). Each route group owns its own chrome:
  - `(marketing)` uses `SiteHeader` and the multi-column `SiteFooter` from `components/marketing`.
  - `(auth)` shows a minimal logo bar with no footer.
  - `(app)` uses `AppShell`, a Zapier-style sidebar with no marketing footer.
- `(marketing)/page.tsx` is a static server component. Keep it free of client hooks so it ships no page JS.
- `(marketing)/docs/page.tsx` is the user documentation, also a static server component (copy buttons and the section nav are the only client islands). Its section list comes from the `toc` array, rendered by `components/docs/docs-toc.tsx`, which highlights the current section on scroll (frame-throttled scroll listener, no polling). The connector reference, sample integrations and the webhook sender table render from `action-fields.ts`, `integration-catalog.ts`, `zap-templates.ts` and `webhook-senders.ts`, so update those registries rather than hard-coding copy. Update this page when user-facing behavior, connectors, templating or the public API change.
- `(auth)/login` and `(auth)/signup` are server pages that render the shared client `AuthForm`. `(auth)/layout.tsx` centers the card.
- `(app)/layout.tsx` wraps `dashboard`, `integrations`, `usage`, `settings`, `zap/create`, `zap/[id]` and `zap/[id]/edit` in `RequireAuth` (redirects to `/login` without a session) and `AppShell`. These pages are client components that fetch through `useApi`.
- `zap/create` and `zap/[id]/edit` both render `ZapBuilder` (`components/zap/zap-builder.tsx`). The edit page loads the zap and passes it in; saving sends `PUT /zap/:id` and returns to the zap page. The zap page header has the on/off `ZapToggle`.
- `zap/create` has an optional Name field (prefilled with a template's name) sent as `name` on publish. `zap/[id]` has two link tabs. Overview shows a curl whose body lists exactly the fields the zap's steps read, and opens `StepDetailsDialog` when an action step is clicked. History (`?tab=history`, the target of run-failure emails) renders `RunHistory`. The tab is read with `useSearchParams()`.
- `zap/create` reads `?template=<id>` with `useSearchParams()` (the page is prerendered, so the `searchParams` prop would be empty) and renders the builder keyed by that id, so switching templates resets state. The builder prefills once, after both integration lists load. It shows an info alert when the server lacks a connector the template needs.
- `(app)/usage` shows steps run per month from `GET /usage`: this month's count and a bar per month for the last six, drawn with plain elements and tokens (no chart library).
- Pages render loading (`Skeleton`), empty, error (`Alert`) and success states. Keep all four when changing a page.
- `next.config.ts` builds a standalone server, sets security headers and traces from the monorepo root. Lint runs at the repo root, not in `next build`.
- Verify with `bun run typecheck` and `bun run build`, then check affected routes with `bun run dev` in light and dark themes.
