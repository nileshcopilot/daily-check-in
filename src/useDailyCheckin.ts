import { useCallback, useEffect, useState } from 'react';

export interface CheckinTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

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
  /** Base URL for API calls */
  baseUrl?: string;
  /** Session key for authentication (sent via 'session-key' / 'Sessionkey' header) */
  sessionKey?: string;
  /** Locale language code (e.g. 'en', 'hi', etc.) to be sent in Accept-Language header */
  locale?: string;
  /** Additional headers for API calls (e.g. Authorization token) */
  apiHeaders?: Record<string, string>;
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
  /** Dynamic rewards data returned from the API */
  dailyStreakCoins?: Array<{ day_number: number; coins: string | number }>;
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
  const {
    storageKey = 'daily-checkin',
    autoShow = true,
    autoShowDelay = 600,
    onCheckIn,
    baseUrl,
    sessionKey,
    locale = 'en',
    apiHeaders,
  } = options;

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CheckinState>({ lastCheckin: null, streak: 0 });
  const [apiData, setApiData] = useState<{
    allowClaim: number;
    currentDay: number;
    dailyStreakCoins: Array<{ day_number: number; coins: string | number }>;
  } | null>(null);

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

  // Fetch streak state from API whenever the popup opens
  useEffect(() => {
    if (!open || !baseUrl) return;

    const fetchStreakData = async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
          ...apiHeaders,
        };
        if (sessionKey) {
          headers['Sessionkey'] = sessionKey;
        }

        const response = await fetch(`${baseUrl}/user/coins/get_daily_streak_coins`, {
          method: 'POST',
          headers,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data && typeof data === 'object') {
          const payload = data.data || data;

          const allowClaim = payload.allow_claim !== undefined ? Number(payload.allow_claim) : null;
          const currentDay = payload.current_day !== undefined ? Number(payload.current_day) : null;
          const dailyStreakCoins = Array.isArray(payload.daily_streak_coins) ? payload.daily_streak_coins : null;

          if (allowClaim !== null && currentDay !== null && dailyStreakCoins !== null) {
            setApiData({
              allowClaim,
              currentDay,
              dailyStreakCoins,
            });

            // Sync with local state
            const checkedInToday = allowClaim === 0;
            const serverStreak = checkedInToday ? currentDay : currentDay - 1;
            const next = {
              lastCheckin: checkedInToday ? localDate() : yesterdayDate(),
              streak: serverStreak,
            };
            writeState(storageKey, next);
            setState(next);
          } else {
            const serverStreak = typeof payload.streak === 'number' ? payload.streak : null;
            const serverLastCheckin = typeof payload.lastCheckin === 'string' ? payload.lastCheckin : null;

            if (serverStreak !== null || serverLastCheckin !== null) {
              setState((prev) => {
                const next = {
                  lastCheckin: serverLastCheckin !== null ? serverLastCheckin : prev.lastCheckin,
                  streak: serverStreak !== null ? serverStreak : prev.streak,
                };
                writeState(storageKey, next);
                return next;
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch daily streak coins:', err);
      }
    };

    fetchStreakData();
  }, [open, baseUrl, storageKey, sessionKey, locale, apiHeaders]);

  const today = localDate();
  const checkedInToday = apiData
    ? apiData.allowClaim === 0
    : state.lastCheckin === today;

  // Streak is only "alive" if the last check-in was today or yesterday
  const streak = apiData
    ? (apiData.allowClaim === 0 ? apiData.currentDay : apiData.currentDay - 1)
    : (state.lastCheckin === today || state.lastCheckin === yesterdayDate() ? state.streak : 0);

  const checkIn = useCallback(() => {
    if (apiData) {
      setApiData((prev) => {
        if (!prev) return null;
        const nextStreak = prev.currentDay;
        const now = localDate();
        onCheckIn?.({ streak: nextStreak, date: now });

        // Sync local storage state
        writeState(storageKey, {
          lastCheckin: now,
          streak: nextStreak,
        });

        return {
          ...prev,
          allowClaim: 0,
        };
      });
    } else {
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
    }
  }, [apiData, storageKey, onCheckIn]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setState({ lastCheckin: null, streak: 0 });
    setApiData(null);
  }, [storageKey]);

  return { open, setOpen, streak, checkedInToday, checkIn, reset, dailyStreakCoins: apiData?.dailyStreakCoins || undefined };
}
