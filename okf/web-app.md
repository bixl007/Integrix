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
- `(auth)/login` and `(auth)/signup` are server pages that render the shared client `AuthForm`. `(auth)/layout.tsx` centers the card.
- `(app)/layout.tsx` wraps `dashboard`, `integrations`, `settings`, `zap/create` and `zap/[id]` in `RequireAuth` (redirects to `/login` without a session) and `AppShell`. These pages are client components that fetch through `useApi`.
- Pages render loading (`Skeleton`), empty, error (`Alert`) and success states. Keep all four when changing a page.
- `next.config.ts` builds a standalone server, sets security headers and traces from the monorepo root. Lint runs at the repo root, not in `next build`.
- Verify with `bun run typecheck` and `bun run build`, then check affected routes with `bun run dev` in light and dark themes.
