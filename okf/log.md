# Integrix knowledge bundle updates

## 2026-11-22 (profile)

- Added the Settings page and `/api/v1/profile` (name, verified email change, password change that revokes other sessions) and an OTP `purpose` column.

## 2026-11-22 (auth)

- Replaced JWT-in-localStorage with 7-day httpOnly cookie sessions, added email OTP for signup and login, Google OAuth, and the shared `@integrix/mailer` package.

## 2026-11-22 (monochrome)

- Removed the purple/pink brand gradient; the UI is monochrome again.

## 2026-11-22 (UI)

- Split chrome per route group (marketing footer only on public pages, Zapier-style sidebar in the app), added the brand gradient, menu and avatar primitives, and the Integrations page.

## 2026-11-22

- Created the bundle with guides for every app and package, and connected the root agent entry files (`CLAUDE.md`, `AGENTS.md`, `REVIEW.md`).
