# Integrix agent instructions

Read the [shared repository instructions](CLAUDE.md) first. Before editing a module, open the [OKF index](okf/index.md) and follow the guides for the affected paths. Review changes against [REVIEW.md](REVIEW.md). [ARCHITECTURE.md](ARCHITECTURE.md) explains how the services fit together.

Every feature or behavior change must also update its docs in the same change: the affected `okf/` guide plus an `okf/log.md` entry, the in-app docs page (`apps/web/app/(marketing)/docs/page.tsx`) for user-facing changes, `ARCHITECTURE.md` for architectural changes, and the README for setup or informational changes. See [CLAUDE.md](CLAUDE.md#documentation).
