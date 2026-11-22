---
type: Module
title: Design system
description: Tokens, primitives, themes and icons.
resource: ../apps/web/components/ui/
---

# Design system (Vercel/Geist style)

- **Tokens** live in `apps/web/app/globals.css`. CSS variables on `:root` and `.dark` are mapped to Tailwind v4 via `@theme inline`. Use only semantic utilities such as `bg-background`, `bg-background-subtle`, `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`, `border-border-strong`, `bg-primary`, `text-accent`, `text-success` and `text-destructive`, never raw hex values. To add a token, define it in both themes and map it in `@theme inline`.
- **Color**: strictly monochrome (Vercel style). Emphasis comes from `bg-primary`/`text-primary-foreground` (black on light, white on dark), not hues. Reserve `accent`, `success` and `destructive` for status. Don't add gradients or brand colors. `animate-flow` sends a neutral beam through `StepConnector animated` (transform-only).
- **Type**: Geist Sans (`font-sans`) for UI and Geist Mono (`font-mono`) for URLs, IDs and code. Headings use `font-semibold tracking-tight`.
- **Shape**: `rounded-md` (6px) for controls, `rounded-lg` (12px) for cards and dialogs, 1px borders and minimal shadows.
- **Primitives**:
  - `button.tsx`: `Button` and `buttonVariants({ variant, size })` for styling links. Variants are primary, secondary, ghost and danger; sizes are sm, md, lg and icon.
  - `input.tsx`: `Input` (with a password reveal) and `Textarea`, both with a label, hint and error wired via `aria-describedby`.
  - `card.tsx`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` and `CardFooter`.
  - `badge.tsx`, `alert.tsx` (with an error or status role), `skeleton.tsx` and `copy-button.tsx`.
  - `dialog.tsx`: a native `<dialog>` with focus trap and Esc to close.
  - `theme-switcher.tsx`: a system/light/dark radio group, shown in the marketing footer and the account menu.
  - `menu.tsx`: a dropdown (`Menu`, `MenuItem`, `MenuLink`, `MenuLabel`, `MenuSeparator`) that closes on outside click, Esc or item select.
  - `avatar.tsx`: initials on `bg-primary`.
  - `icons.tsx`: inline Lucide-path SVGs. Add icons there instead of installing an icon package.
- Primitives hold no business logic or data fetching. Extend through props and `className` (merged by `cn`), not by forking a primitive.
- Motion is CSS-only (`animate-fade-in`, transitions) and respects `prefers-reduced-motion`.
- Verify with `bun run lint` and `bun run build`, then check each changed primitive with a keyboard in both themes.
