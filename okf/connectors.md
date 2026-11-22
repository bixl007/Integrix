---
type: Module
title: Connectors
description: The cross-module checklist for adding or changing a trigger or action, and the path to user-configurable connectors.
resource: ../
---

# Connectors (triggers and actions)

A connector is one string id (`webhook`, `schedule`, `email`, `filter`, `delay`, `solana`) shared by every layer. Extend the registries below and never branch on the id. See [ARCHITECTURE.md](../ARCHITECTURE.md#7-connector-model) for the design.

## Add an action

1. `packages/database/seed.ts`: add `{ id, name, image }` to `actions`. The seed upserts, so existing databases pick it up on the next `bun run dev` or Compose start.
2. `apps/worker/src/actions/<id>.ts`: export an `ActionHandler`. Read settings from `metadata`, pass every user value through `parse(value, payload)` (`payload` is the request body plus earlier step outputs under `steps`, so `{steps.N.field}` works in every field), and throw on failure so the worker retries the stage and then marks the run failed. Optionally return `{ output }` (a JSON object stored on the run's step and shown in History), `{ halt: true }` to end the run without an error, or `{ delayMs }` to make the run wait before its next step. Never sleep in a handler. Keep it idempotent where possible and keep secrets out of logs. Register it in `actions/index.ts`.
3. `apps/web/components/zap/action-fields.ts`: add the form fields. Each `key` is the metadata key the handler reads. A field with `options` renders a select (its `value`s are what the handler receives), and `optional` lets it be left empty.
4. `apps/web/components/zap/integration-catalog.ts`: add `{ name, kind: 'action', description }`. For a built-in icon, add an SVG to `components/ui/icons.tsx` and map it in `integration-icon.tsx`.
5. Optional: add a sample to `zap-templates.ts`. It appears on `/docs` and opens prefilled in the builder through `/zap/create?template=<id>`.
6. Docs: the `/docs` connector reference renders from steps 3 and 4. Add any server env vars to `.env.example` and the README table, and note behavior worth knowing (limits, costs, side effects) in the docs page connector notes.

Add a trigger the same way, using `triggers` in the seed and `kind: 'trigger'`. A trigger's settings go in the same `action-fields.ts` registry under its id and are stored as `Trigger.metadata`. Two triggers exist: `webhook`, whose intake is `hooks`, and `schedule`, whose runs the processor starts. A new trigger type needs its own intake that writes `ZapRun` (with `snapshotActions`) and `ZapRunOutbox` in one transaction. Give it a card on the zap page and a dashboard summary in `trigger-panels.tsx`.

## Rules

- Never rename or delete a seeded id. Zaps reference it, and every registry keys on it.
- Metadata stays a flat map of template strings until per-connector schemas exist.
- `bun test` runs `zap-templates.test.ts`, which checks that samples use known connectors and exactly their form fields.

## Toward user-configurable connectors

This is planned, not built (see [ARCHITECTURE.md](../ARCHITECTURE.md#toward-user-configurable-connectors-planned-not-built)). Field schemas and copy move to the catalog rows served by the API, credentials move to an encrypted per-user `Connection`, and `ActionHandler` gains an optional context argument. Until then:

- Consume connectors through id-keyed lookups and the `Integration` shape from the API, never through concrete imports.
- Don't add per-connector branches in shared components.
- Keep connector data (fields, samples) serializable so it can move into the database unchanged.
