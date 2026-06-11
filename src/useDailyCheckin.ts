import { useCallback, useEffect, useState } from 'react';

export interface CheckinState {
  /** Last check-in date as YYYY-MM-DD (local time), or null if never */
  lastCheckin: string | null;
  /** Current consecutive-day streak */
  streak: number;
}

export interface CheckinInfo {
  /** Streak after this check-in */
  streak: number;
  /** Date of this check-in, YYYY-MM-DD local */
  date: string;
}

export interface UseDailyCheckinOptions {
  /** localStorage key. Use a different key per app/feature. Default: "daily-checkin" */
  storageKey?: string;
  /** Automatically open the popup on mount (currently every time, not once per day). Default: true */
  autoShow?: boolean;
  /** Delay in ms before auto-opening. Default: 600 */
  autoShowDelay?: number;
  /** Called once when the user checks in for the day */
  onCheckIn?: (info: CheckinInfo) => void;
}

export interface UseDailyCheckinReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Streak counting today (0 if the chain is broken and not yet checked in) */
  streak: number;
  checkedInToday: boolean;
  /** Perform today's check-in. No-op if already checked in today. */
  checkIn: () => void;
  /** Clear stored state (useful for testing/logout) */
  reset: () => void;
}

/** YYYY-MM-DD in the user's local timezone */
function localDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
}

function readState(key: string): CheckinState {
  if (typeof window === 'undefined') return { lastCheckin: null, streak: 0 };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { lastCheckin: null, streak: 0 };
    const parsed = JSON.parse(raw);
    return {
      lastCheckin: typeof parsed.lastCheckin === 'string' ? parsed.lastCheckin : null,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
    };
  } catch {
    return { lastCheckin: null, streak: 0 };
  }
}

function writeState(key: string, state: CheckinState): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode etc.) — popup still works, just won't persist
  }
}

export function useDailyCheckin(options: UseDailyCheckinOptions = {}): UseDailyCheckinReturn {
  const { storageKey = 'daily-checkin', autoShow = true, autoShowDelay = 600, onCheckIn } = options;

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CheckinState>({ lastCheckin: null, streak: 0 });

  // Read storage after mount so SSR markup stays stable (no hydration mismatch)
  useEffect(() => {
    const stored = readState(storageKey);
    setState(stored);
    // For now: show on every mount, even if already checked in today
    if (autoShow) {
      const t = window.setTimeout(() => setOpen(true), autoShowDelay);
      return () => window.clearTimeout(t);
    }
  }, [storageKey, autoShow, autoShowDelay]);

  const today = localDate();
  const checkedInToday = state.lastCheckin === today;

  // Streak is only "alive" if the last check-in was today or yesterday
  const streak =
    state.lastCheckin === today || state.lastCheckin === yesterdayDate() ? state.streak : 0;

  const checkIn = useCallback(() => {
    setState((prev) => {
      const now = localDate();
      if (prev.lastCheckin === now) return prev;
      const next: CheckinState = {
        lastCheckin: now,
        streak: prev.lastCheckin === yesterdayDate() ? prev.streak + 1 : 1,
      };
      writeState(storageKey, next);
      onCheckIn?.({ streak: next.streak, date: now });
      return next;
    });
  }, [storageKey, onCheckIn]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setState({ lastCheckin: null, streak: 0 });
  }, [storageKey]);

  return { open, setOpen, streak, checkedInToday, checkIn, reset };
}
