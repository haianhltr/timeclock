# Sprint 01 — respect `prefers-color-scheme` when no theme cookie

## Goal

Dark-OS visitors get dark mode on first load (no cookie required). Once they click the toggle, that explicit choice wins forever.

## Why

Today `getTheme()` returns `"light"` when no cookie is set, ignoring the OS preference. Visiting from a dark-mode browser at night → flash of bright cream → bad first impression. The fix is mostly CSS — no JS-side detection that would flash.

## Scope

- `getTheme()` returns `null` when no cookie is set (instead of forcing `"light"`).
- `<html data-theme>` is omitted in that case.
- `globals.css` adds a `@media (prefers-color-scheme: dark)` block that applies the dark tokens to `:root:not([data-theme="light"])` — so visitors with no cookie get OS-driven dark, but an explicit `data-theme="light"` cookie still wins.

## Out of scope

- A 3-way toggle ("system / light / dark"). One-click flip stays.
- Auto-detecting OS theme on first toggle to set initial state — not needed; the media query handles unset.

## Files

- `src/frontend/app/globals.css`
- `src/frontend/lib/theme.ts`
- `src/frontend/app/layout.tsx`

## Approach

1. `lib/theme.ts` → `getTheme(): Promise<Theme | null>` returning `null` when cookie absent.
2. `app/layout.tsx` → render `<html data-theme={theme ?? undefined}>`. React omits the attr when value is `undefined`.
3. `globals.css` → wrap the dark tokens block in `@media (prefers-color-scheme: dark)` and use `:root:not([data-theme="light"])` so explicit `light` overrides OS-dark. Keep the existing `:root[data-theme="dark"]` block as-is so explicit `dark` works in any OS.
4. `ThemeToggle` may need the icon logic to handle null theme (treat null as "follow system" — show the icon for the OS preference). Simple: keep current behaviour and have null fall back to "light" for icon purposes only.

## Acceptance

- Cookie unset + OS dark → page renders dark on first paint.
- Cookie unset + OS light → page renders light.
- Click toggle → cookie set, OS pref no longer matters.
- Reload after explicit toggle → stays on the chosen theme regardless of OS.

## Test plan

- Vitest: `getTheme()` returns null when cookie absent, "dark"/"light" otherwise.
- Manual: DevTools → Rendering → Emulate `prefers-color-scheme: dark`, incognito, visit `/` → dark from first byte (view source: no `data-theme` attr on `<html>`).
- Manual: same emulation, click moon icon → cookie set to "light", reload → renders light (cookie wins).

## Conflicts

None.
