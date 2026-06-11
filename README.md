# @nileshp.vinfotech/daily-checkin-popup

Daily check-in popup for React with streak tracking. Zero runtime dependencies, ships its own styles, SSR-safe (Next.js App Router compatible).

- Auto-shows **once per day** per browser (localStorage-gated)
- Tracks consecutive-day **streaks** (missing a day resets to 1)
- Fully themeable via `--dcp-*` CSS variables
- Controlled or uncontrolled, plus a headless `useDailyCheckin` hook

## Install

```bash
npm install @nileshp.vinfotech/daily-checkin-popup
```

## Quick start (Next.js / React)

Drop it anywhere in your layout — it opens by itself once per day:

```tsx
'use client';

import { DailyCheckinPopup } from '@nileshp.vinfotech/daily-checkin-popup';

export function DailyCheckin() {
  return (
    <DailyCheckinPopup
      title="Daily Check-in"
      subtitle="Claim your daily bonus!"
      rewards={['+10', '+20', '+30', '+40', '+50', '+75', '+100']}
      onCheckIn={({ streak, date }) => {
        // sync with your backend, credit the reward, etc.
        fetch('/api/v1/checkin', { method: 'POST', body: JSON.stringify({ streak, date }) });
      }}
    />
  );
}
```

In Next.js App Router, mark the file `'use client'` (the popup uses state, effects, and `localStorage`).

## Controlled mode

Manage visibility yourself (e.g. open from a button):

```tsx
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Daily bonus</button>
<DailyCheckinPopup open={open} onOpenChange={setOpen} />
```

## Headless hook

Build your own UI on top of the same logic:

```tsx
import { useDailyCheckin } from '@nileshp.vinfotech/daily-checkin-popup';

const { open, setOpen, streak, checkedInToday, checkIn, reset } = useDailyCheckin({
  storageKey: 'my-app-checkin',
  onCheckIn: ({ streak }) => console.log('streak:', streak),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` / `onOpenChange` | `boolean` / `(open) => void` | — | Controlled mode |
| `autoShow` | `boolean` | `true` | Auto-open once per day (uncontrolled mode) |
| `autoShowDelay` | `number` | `600` | ms before auto-opening |
| `storageKey` | `string` | `"daily-checkin"` | localStorage key (use one per app) |
| `onCheckIn` | `(info: { streak, date }) => void` | — | Fires once per day on check-in |
| `title` / `subtitle` | `ReactNode` | … | Header text |
| `days` | `number` | `7` | Tiles in the streak row (streak wraps each cycle) |
| `rewards` | `ReactNode[]` | `Day N` | Label under each tile |
| `doneIcon` / `pendingIcon` | `ReactNode` | `✓` / `🎁` | Tile icons |
| `buttonLabel` / `checkedInLabel` | `ReactNode` | `Check in` / `Checked in ✓` | Button text |
| `closeDelay` | `number` | `1500` | Auto-close ms after check-in (`0` = stay open) |
| `closeOnOverlayClick` | `boolean` | `true` | Click backdrop to dismiss |
| `className` | `string` | — | Extra class on the card |

## Theming

All visuals read CSS variables with sensible fallbacks. Define them globally or per theme:

```css
:root {
  --dcp-accent: #6366f1;        /* buttons, active tiles, streak count */
  --dcp-accent-text: #fff;
  --dcp-bg: #ffffff;            /* card background */
  --dcp-text: #1a1a2e;
  --dcp-muted: #6b7280;
  --dcp-day-bg: #f3f4f6;
  --dcp-day-done-bg: rgba(99, 102, 241, 0.12);
  --dcp-success: #10b981;
  --dcp-overlay-bg: rgba(0, 0, 0, 0.55);
  --dcp-radius: 16px;
  --dcp-max-width: 400px;
  --dcp-z-index: 1000;
}

[data-theme='dark'] {
  --dcp-bg: #16161f;
  --dcp-text: #e5e7eb;
  --dcp-day-bg: #23232f;
  --dcp-hover: rgba(255, 255, 255, 0.08);
}
```

## Using it locally (before publishing)

From any project:

```bash
npm install /Users/nilesh/daily-checkin-popup
# or, for live development:
cd ~/daily-checkin-popup && npm link
cd ~/your-project && npm link @nileshp.vinfotech/daily-checkin-popup
```

## Publishing to npm

```bash
cd ~/daily-checkin-popup
npm login
npm publish --access public   # scoped packages need --access public
```

Rename the package in `package.json` if you want a different scope/name.

## Development

```bash
npm install
npm run build   # outputs dist/ (ESM + CJS + .d.ts)
npm run dev     # watch mode
```
