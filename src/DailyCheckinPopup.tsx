import { useEffect, useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { injectStyles } from './styles';
import {
  useDailyCheckin,
  type CheckinInfo,
  type UseDailyCheckinOptions,
  type CheckinTheme,
} from './useDailyCheckin';
import { locales, renderTemplate, interpolateDay } from './locales';
import { Particles } from './Particles';

export interface DailyCheckinPopupProps extends UseDailyCheckinOptions {
  /** Controlled open state. Omit to let the popup manage itself (auto-show once per day). */
  open?: boolean;
  /** Called when the popup wants to open/close (controlled mode) */
  onOpenChange?: (open: boolean) => void;
  /** Heading. Default: "Daily Check-in" */
  title?: ReactNode;
  /** Line under the heading. Default: "Check in to get <coin> <today's reward>" */
  subtitle?: ReactNode;
  /** Small text under the subtitle. Default: "You must claim daily bonus every day to form a streak!" */
  note?: ReactNode;
  /** Number of days shown in the grid. Default: 7 */
  days?: number;
  /** Reward amount per day tile, e.g. [5, 20, 30, 40, 50]. */
  rewards?: ReactNode[];
  /** Unit label under each reward, e.g. "Token" or "Coins". Default: "Token" */
  unitLabel?: ReactNode;
  /** Icon in the corner badge of a completed day. Default: "✓" */
  doneIcon?: ReactNode;
  /** Number of tile columns. Default: 3 */
  columns?: number;
  /** Check-in button label. Default: "CLAIM" */
  buttonLabel?: ReactNode;
  /** Button label after checking in. Default: "CLAIMED ✓" */
  checkedInLabel?: ReactNode;
  /** Close the popup automatically this many ms after check-in. 0 disables. Default: 1500 */
  closeDelay?: number;
  /** Close when the overlay backdrop is clicked. Default: false */
  closeOnOverlayClick?: boolean;
  /** Extra class on the popup card */
  className?: string;
  /** Locale language code (e.g. 'en', 'es', 'fr', 'de', 'hi', 'zh'). Default: 'en' */
  locale?: string;
  /** Theme styling configuration options */
  theme?: CheckinTheme;
  /** Base URL for API calls (e.g. "https://corep.vinfotech.org/user") */
  baseUrl?: string;
  /** Session key for authentication (sent via 'session-key' header) */
  sessionKey?: string;
  /** Additional headers for API calls (e.g. Authorization token) */
  apiHeaders?: Record<string, string>;
}

const COIN_IMAGE = 'data:image/webp;base64,UklGRkoEAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSEkBAAABkGvb2rFXO7Zt+wJSJaVqu2Rlu7KdOiOd0zk5tm3bxvf/73vw4X2fK4iICYBxt/zFGx9/MaZ8ebjd5QvZAVWHTFw3e9zrIsNj8BcXaF5yFGXf8JELVhbExN7iEt/7CEj7wKWasgxVm7hkVmqgmstnWbrSTAS4kqQj9gMn+ctHw/4WJ/pSo5FTZY0qHh/I8N8qg5zwHICAn5QUAFWcdBqwSWsbbr9pfUY+p82iponx5h1qiw+oHXtP7bpC7elXag+fULt8mdruBrW5TmplmcTM9u6/aD0A1mmNAvmkWBDg8ILSbQCoJsSS/3N4R+cMVHvIsCg1nKUyBU2HLzROQ2fKbwpvrPUg+Y2872HQH3NP1ssAGPV9LeecNYx7nGLizPMQm/tBEDsdBuEtnwSwu6mQmtR3g+lhj0d8IN83vWvp2I1H1/emS1wgEABWUDgg2gIAAFAQAJ0BKjAAMAA+bTCRRaQjIZcaBmRABsS2AE6ZQjsP3jzBKV/KPvLtCJAu0zGr6gNsx5iP2F/bHsW/5L1AP256xj0K/Lg/bH4Of3E/bf2kU+3LWqqR9opDfL/wFrW1w3oQUN1Ppz9kIubudiXuf3Yx6IpARwAfSwhi2XeuXpChwtAxGeB9kz17cAAA/vYJ09WTT3xCi1J9Jq3tXE4YiM0kubBPCG18gILYn/mcSuXKecVYx+VH8+/3Jaw71cqA3QUMorqXx+0HY5lRjzZoSpwUOrZsn5l2sq5FvGHjeiYhTMdP/vMao9xPicytNu792iLMMXYqSBrx/87XDP76mt0wJ4fNR+kRLk+0X7FWQInSVOEUye3HoEhBE79oHHIjfJzKzETvSMr8mVg0C+2cciKNc+RzbWS9bIugTZHFJH0iKfsMeIYL16bX3SgxJ48n39jLpm8dWE4pM6V4RDWJ2PnKM5s2spJRoMx0mbHKaQHSlsjaHaHvlgQzVgDI/UGKZGaiSmGMczxKaYHfxLF98uSVH2uaxsvvUz++XiK9SoUF1AYTQgTobO85hrO5yIU7xv6ydCMpVSrWr9lONlhPOIDGfU74TFvJsXjITMijzHVRZAKUDUgrjEl8e1cGC48efqTBQgyVu8TldkR07H6Tq/xe5m7whEcZTFFi4UaTB00z3sEgJxesACi0SC1I6IuFQGnpR6PN/2FEp1ztFwCZUQx6Su/LclEErk/nmxPAzKSwhieYyV0cGt6eKwoAPLg2t8QmCSNha9H553MuAVDI1IiDRTHF/n0MwSBwtHhhhHkoKic5iK/3BBv6kL2ZOig4y0Xyejy8X/Xs2yNjv2CJi88Ae5uqIEaQIAVQQekjsjPNsRr078SVLv+X8OMsB2lpLju2tyFHqezQHfeq1pp4q+jqiQWJMkskE6mCIS5oVfE5tT/PwW9N/C36v4RAZRjyf7em4Ac0bpKgAAA=';

/** Gold coin with a star — dimmed (grey) version for upcoming days */
function Coin({ dim }: { dim?: boolean }) {
  return (
    <img
      className="dcp-coin"
      src={COIN_IMAGE}
      alt=""
      style={dim ? { filter: 'grayscale(1) opacity(0.5)' } : undefined}
    />
  );
}

let particleCounterId = 1;

export function DailyCheckinPopup(props: DailyCheckinPopupProps) {
  const [particles, setParticles] = useState<number[]>([]);
  const [btnState, setBtnState] = useState<'ready' | 'loading' | 'complete'>('ready');
  const isAnimatingRef = useRef(false);

  const cleanParticle = (id: number) => {
    setParticles((prev) => prev.filter((item) => item !== id));
  };

  const {
    open: controlledOpen,
    onOpenChange,
    title,
    subtitle,
    note,
    days = 7,
    rewards,
    unitLabel,
    doneIcon = '✓',
    columns = 3,
    buttonLabel,
    checkedInLabel,
    closeDelay = 1500,
    closeOnOverlayClick = false,
    className,
    locale = 'en',
    theme,
    baseUrl,
    ...hookOptions
  } = props;

  const activeLocale = locales[locale] ? locale : 'en';
  const defaultTexts = locales[activeLocale];

  const activeTitle = title !== undefined ? title : defaultTexts.title;
  const activeNote = note !== undefined ? note : defaultTexts.note;
  const activeUnitLabel = unitLabel !== undefined ? unitLabel : defaultTexts.unitLabel;
  const activeButtonLabel = buttonLabel !== undefined ? buttonLabel : defaultTexts.buttonLabel;
  const activeCheckedInLabel = checkedInLabel !== undefined ? checkedInLabel : defaultTexts.checkedInLabel;

  const customStyles: Record<string, string> = {};
  if (theme) {
    if (theme.primaryColor) customStyles['--dcp-bg'] = theme.primaryColor;
    if (theme.secondaryColor) customStyles['--dcp-secondary'] = theme.secondaryColor;
    if (theme.accentColor) customStyles['--dcp-accent'] = theme.accentColor;
  }

  const isControlled = controlledOpen !== undefined;
  const checkin = useDailyCheckin({
    ...hookOptions,
    locale,
    baseUrl,
    // In controlled mode the host decides when to show the popup
    autoShow: isControlled ? false : hookOptions.autoShow,
  });

  const open = isControlled ? controlledOpen : checkin.open;
  const setOpen = (next: boolean) => {
    if (!isControlled) checkin.setOpen(next);
    onOpenChange?.(next);
  };

  const { streak, checkedInToday, dailyStreakCoins } = checkin;

  useEffect(() => {
    if (open && !isAnimatingRef.current) {
      setBtnState(checkedInToday ? 'complete' : 'ready');
    }
  }, [open, checkedInToday]);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  // Resolve rewards list and days count from API data if available
  const activeRewards = dailyStreakCoins
    ? dailyStreakCoins.map((item) => item.coins)
    : rewards;
  const activeDaysCount = dailyStreakCoins
    ? dailyStreakCoins.length
    : days;

  // Position within the visible cycle: streak 1..days maps to tile 0..days-1, then wraps
  const doneCount = streak === 0 ? 0 : ((streak - 1) % activeDaysCount) + 1;
  const todayIndex = checkedInToday ? -1 : doneCount;
  // Reward the user gets (or got) for today's check-in, shown in the subtitle
  const currentIndex = Math.min(checkedInToday ? Math.max(doneCount - 1, 0) : doneCount, activeDaysCount - 1);
  const currentReward = activeRewards?.[currentIndex];

  const activeSubtitle = subtitle ?? renderTemplate(defaultTexts.subtitle, {
    coin: <Coin />,
    reward: currentReward ?? '',
  });

  const handleCheckIn = () => {
    if (btnState !== 'ready') return;
    isAnimatingRef.current = true;
    setBtnState('loading');
    checkin.checkIn();

    setTimeout(() => {
      setBtnState('complete');
      isAnimatingRef.current = false;
      
      const id = particleCounterId++;
      setParticles((prev) => [...prev, id]);
      setTimeout(() => {
        cleanParticle(id);
      }, 6000);

      if (closeDelay > 0) {
        window.setTimeout(() => setOpen(false), closeDelay);
      }
    }, 1000);
  };

  return createPortal(
    <div
      className="dcp-overlay"
      onClick={closeOnOverlayClick ? () => setOpen(false) : undefined}
      role="presentation"
    >
      <div
        className={className ? `dcp-card ${className}` : 'dcp-card'}
        style={{
          ['--dcp-columns' as string]: columns,
          ...customStyles,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof activeTitle === 'string' ? activeTitle : 'Daily check-in'}
      >
        <div className="dcp-modal-img-wrap">
          <div className="dcp-wrap-with-img">
            <img
              className="dcp-badge-img"
              src={COIN_IMAGE}
              alt=""
              decoding="async"
              loading="lazy"
            />
          </div>
        </div>
        <button className="dcp-close" onClick={() => setOpen(false)} aria-label="Close">
          ×
        </button>
        <h2 className="dcp-title">{activeTitle}</h2>
        <p className="dcp-subtitle">
          {activeSubtitle}
        </p>
        {activeNote ? <p className="dcp-note">{activeNote}</p> : null}
        <div className="dcp-days">
          {Array.from({ length: activeDaysCount }, (_, i) => {
            const done = i < doneCount;
            const isToday = i === todayIndex;
            const cls = [
              'dcp-day',
              done && 'dcp-day-done',
              isToday && 'dcp-day-today',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={i} className={cls}>
                {done ? <span className="dcp-day-check">{doneIcon}</span> : null}
                <span className="dcp-day-name">
                  {interpolateDay(defaultTexts.dayLabel, i + 1)}
                </span>
                {activeRewards?.[i] != null ? (
                  <>
                    <span className="dcp-day-value">{activeRewards[i]}</span>
                    <span className="dcp-day-unit">
                      <Coin dim={!done && !isToday} /> {activeUnitLabel}
                    </span>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        <button
          className={`dcp-button ${btnState}`}
          onClick={handleCheckIn}
          disabled={btnState !== 'ready'}
        >
          {btnState === 'ready' && (
            <div className="dcp-btn-message dcp-submit-message">
              <span>{activeButtonLabel}</span>
            </div>
          )}
          {btnState === 'loading' && (
            <div className="dcp-btn-message dcp-loading-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 17">
                <circle className="dcp-loading-circle" cx="2.2" cy="10" r="1.6"/>
                <circle className="dcp-loading-circle" cx="9.5" cy="10" r="1.6"/>
                <circle className="dcp-loading-circle" cx="16.8" cy="10" r="1.6"/>
              </svg>
            </div>
          )}
          {btnState === 'complete' && (
            <div className="dcp-btn-message dcp-success-message">
              <span>{activeCheckedInLabel}</span>
            </div>
          )}
        </button>
      </div>
      {particles.map((id) => (
        <Particles key={id} count={Math.floor(window.innerWidth / 5)} />
      ))}
    </div>,
    document.body
  );
}

export type { CheckinInfo };
