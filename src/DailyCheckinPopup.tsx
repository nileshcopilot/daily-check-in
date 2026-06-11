import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { injectStyles } from './styles';
import {
  useDailyCheckin,
  type CheckinInfo,
  type UseDailyCheckinOptions,
} from './useDailyCheckin';

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
  /** Close when the overlay backdrop is clicked. Default: true */
  closeOnOverlayClick?: boolean;
  /** Extra class on the popup card */
  className?: string;
}

/** Gold coin with a star — dimmed (grey) version for upcoming days */
function Coin({ dim }: { dim?: boolean }) {
  return (
    <svg className="dcp-coin" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill={dim ? '#b9c0c9' : '#f0a92e'} />
      <circle cx="12" cy="12" r="8.5" fill={dim ? '#d9dee4' : '#ffd84d'} />
      <path
        d="M12 6.6l1.55 3.15 3.45.5-2.5 2.44.6 3.46L12 14.5l-3.1 1.65.6-3.46L7 10.25l3.45-.5z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function DailyCheckinPopup(props: DailyCheckinPopupProps) {
  const {
    open: controlledOpen,
    onOpenChange,
    title = 'Daily Check-in',
    subtitle,
    note = 'You must claim daily bonus every day to form a streak!',
    days = 7,
    rewards,
    unitLabel = 'Token',
    doneIcon = '✓',
    columns = 3,
    buttonLabel = 'CLAIM',
    checkedInLabel = 'CLAIMED ✓',
    closeDelay = 1500,
    closeOnOverlayClick = true,
    className,
    ...hookOptions
  } = props;

  const isControlled = controlledOpen !== undefined;
  const checkin = useDailyCheckin({
    ...hookOptions,
    // In controlled mode the host decides when to show the popup
    autoShow: isControlled ? false : hookOptions.autoShow,
  });

  const open = isControlled ? controlledOpen : checkin.open;
  const setOpen = (next: boolean) => {
    if (!isControlled) checkin.setOpen(next);
    onOpenChange?.(next);
  };

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

  const { streak, checkedInToday } = checkin;
  // Position within the visible cycle: streak 1..days maps to tile 0..days-1, then wraps
  const doneCount = streak === 0 ? 0 : ((streak - 1) % days) + 1;
  const todayIndex = checkedInToday ? -1 : doneCount;
  // Reward the user gets (or got) for today's check-in, shown in the subtitle
  const currentIndex = Math.min(checkedInToday ? Math.max(doneCount - 1, 0) : doneCount, days - 1);
  const currentReward = rewards?.[currentIndex];

  const handleCheckIn = () => {
    if (checkedInToday) return;
    checkin.checkIn();
    if (closeDelay > 0) {
      window.setTimeout(() => setOpen(false), closeDelay);
    }
  };

  return createPortal(
    <div
      className="dcp-overlay"
      onClick={closeOnOverlayClick ? () => setOpen(false) : undefined}
      role="presentation"
    >
      <div
        className={className ? `dcp-card ${className}` : 'dcp-card'}
        style={{ ['--dcp-columns' as string]: columns }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Daily check-in'}
      >
        <div className="dcp-badge">
          <Coin />
        </div>
        <button className="dcp-close" onClick={() => setOpen(false)} aria-label="Close">
          ×
        </button>
        <h2 className="dcp-title">{title}</h2>
        <p className="dcp-subtitle">
          {subtitle ?? (
            <>
              Check in to get <Coin /> {currentReward ?? ''}
            </>
          )}
        </p>
        {note ? <p className="dcp-note">{note}</p> : null}
        <div className="dcp-days">
          {Array.from({ length: days }, (_, i) => {
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
                <span className="dcp-day-name">Day {i + 1}</span>
                {rewards?.[i] != null ? (
                  <>
                    <span className="dcp-day-value">{rewards[i]}</span>
                    <span className="dcp-day-unit">
                      <Coin dim={!done && !isToday} /> {unitLabel}
                    </span>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        <button className="dcp-button" onClick={handleCheckIn} disabled={checkedInToday}>
          {checkedInToday ? checkedInLabel : buttonLabel}
        </button>
      </div>
    </div>,
    document.body
  );
}

export type { CheckinInfo };
