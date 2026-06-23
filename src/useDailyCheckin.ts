import { useCallback, useEffect, useState, useRef } from 'react';

export interface CheckinTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  dark?: boolean;
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
  /** API response data from claiming coins */
  apiResponse?: any;
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
  /** Called when the daily streak data is successfully fetched from the API */
  onStreakDataFetch?: (data: any) => void;
  /** Base URL for API calls */
  baseUrl?: string;
  /** Session key for authentication (sent via 'session-key' / 'Sessionkey' header) */
  sessionKey?: string;
  /** Locale language code (e.g. 'en', 'hi', etc.) to be sent in Accept-Language header */
  locale?: string;
  /** Additional headers for API calls (e.g. Authorization token) */
  apiHeaders?: Record<string, string>;
  /** Callback to receive raw API responses from fetch and claim actions */
  onApiResponse?: (type: 'fetch' | 'claim', data: any) => void;
  /** The date when the popup was last shown (format: YYYY-MM-DD or Date object or timestamp) */
  lastShownDate?: string | number | Date | null;
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

function normalizeDate(d: Date | string | number | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) {
    return localDate(d);
  }
  if (typeof d === 'number') {
    return localDate(new Date(d));
  }
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return d;
    }
    if (/^\d+$/.test(d)) {
      return localDate(new Date(Number(d)));
    }
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return localDate(parsed);
      }
    } catch {
      // ignore
    }
  }
  return null;
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
    lastShownDate,
    onStreakDataFetch,
    onApiResponse,
  } = options;

  const onCheckInRef = useRef(onCheckIn);
  const onStreakDataFetchRef = useRef(onStreakDataFetch);
  const onApiResponseRef = useRef(onApiResponse);

  useEffect(() => {
    onCheckInRef.current = onCheckIn;
    onStreakDataFetchRef.current = onStreakDataFetch;
    onApiResponseRef.current = onApiResponse;
  });

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CheckinState>({ lastCheckin: null, streak: 0 });
  const [apiData, setApiData] = useState<{
    allowClaim: number;
    currentDay: number;
    dailyStreakCoins: Array<{ day_number: number; coins: string | number }>;
  } | null>(null);
  const [hasAutoShown, setHasAutoShown] = useState(false);

  // Read storage after mount so SSR markup stays stable (no hydration mismatch)
  useEffect(() => {
    const stored = readState(storageKey);
    setState(stored);
  }, [storageKey]);

  // Reset hasAutoShown and apiData when sessionKey or baseUrl changes
  useEffect(() => {
    setHasAutoShown(false);
    setApiData(null);
  }, [sessionKey, baseUrl]);

  // Handle auto-show logic
  useEffect(() => {
    if (!autoShow || hasAutoShown) return;

    const today = localDate();

    if (baseUrl) {
      // API mode: wait until apiData is loaded
      if (!apiData) return;

      const checkedInToday = apiData.allowClaim === 0;
      let shouldShow = !checkedInToday;

      if (shouldShow && lastShownDate !== undefined && lastShownDate !== null) {
        const normalizedLastShown = normalizeDate(lastShownDate);
        const isFirstTimeToday = normalizedLastShown !== today;
        shouldShow = isFirstTimeToday ? !checkedInToday : !checkedInToday;
      }
      if (shouldShow) {
        const t = window.setTimeout(() => {
          setOpen(true)
          setHasAutoShown(true);
        }, autoShowDelay);
        return () => window.clearTimeout(t);
      } else {
        setHasAutoShown(true);
      }
    } else {
      // Local-only mode: use local storage status immediately on mount
      const checkedInTodayOnMount = state.lastCheckin === today;
      let shouldShow = !checkedInTodayOnMount;

      if (shouldShow && lastShownDate !== undefined && lastShownDate !== null) {
        const normalizedLastShown = normalizeDate(lastShownDate);
        const isFirstTimeToday = normalizedLastShown !== today;
        shouldShow = isFirstTimeToday ? !checkedInTodayOnMount : !checkedInTodayOnMount;
      }

      if (shouldShow) {
        const t = window.setTimeout(() => { setOpen(true); setHasAutoShown(true); }, autoShowDelay);
        return () => window.clearTimeout(t);
      } else {
        setHasAutoShown(true);
      }
    }
  }, [autoShow, autoShowDelay, lastShownDate, baseUrl, apiData, state.lastCheckin, hasAutoShown]);

  // Fetch streak state from API on mount, session switch, or when popup opens
  useEffect(() => {
    if (!baseUrl) return;

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

        let data: any = null;
        try {
          data = await response.json();
        } catch {
          data = { message: response.statusText, status: response.status };
        }

        onStreakDataFetchRef.current?.(data);
        onApiResponseRef.current?.('fetch', data);

        if (response.ok && data && typeof data === 'object') {
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
        } else if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err: any) {
        console.error('Failed to fetch daily streak coins:', err);
        onApiResponseRef.current?.('fetch', { message: err?.message || 'Network error, please try again.', error: err });
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

  const checkIn = useCallback(async () => {
    if (apiData) {
      let claimResponseData: any = null;
      if (baseUrl) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
          ...apiHeaders,
        };
        if (sessionKey) {
          headers['Sessionkey'] = sessionKey;
        }

        try {
          const response = await fetch(`${baseUrl}/user/coins/claim_coins`, {
            method: 'POST',
            headers,
          });
          try {
            claimResponseData = await response.json();
          } catch {
            claimResponseData = { message: response.statusText, status: response.status };
          }
          onApiResponseRef.current?.('claim', claimResponseData);
        } catch (err: any) {
          console.error('Failed to claim coins:', err);
          claimResponseData = { message: err?.message || 'Network error, please try again.', error: err };
          onApiResponseRef.current?.('claim', claimResponseData);
        }
      }

      setApiData((prev) => {
        if (!prev) return null;
        const nextStreak = prev.currentDay;
        const now = localDate();
        onCheckInRef.current?.({ streak: nextStreak, date: now, apiResponse: claimResponseData });

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
        onCheckInRef.current?.({ streak: next.streak, date: now });
        return next;
      });
    }
  }, [apiData, baseUrl, storageKey, sessionKey, locale, apiHeaders]);

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
