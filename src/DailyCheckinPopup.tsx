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
  /** Line under the heading. Default: "Come back every day to keep your streak going!" */
  subtitle?: ReactNode;
  /** Number of days shown in the streak row. Default: 7 */
  days?: number;
  /** Label under each day tile, e.g. reward amounts: ["+10", "+20", ...]. Falls back to "Day N". */
  rewards?: ReactNode[];
  /** Icon for a completed day. Default: "✓" */
  doneIcon?: ReactNode;
  /** Icon for an upcoming day. Default: "🎁" */
  pendingIcon?: ReactNode;
  /** Check-in button label. Default: "Check in" */
  buttonLabel?: ReactNode;
  /** Button label after checking in. Default: "Checked in ✓" */
  checkedInLabel?: ReactNode;
  /** Close the popup automatically this many ms after check-in. 0 disables. Default: 1500 */
  closeDelay?: number;
  /** Close when the overlay backdrop is clicked. Default: true */
  closeOnOverlayClick?: boolean;
  /** Extra class on the popup card */
  className?: string;
}

export function DailyCheckinPopup(props: DailyCheckinPopupProps) {
  const {
    open: controlledOpen,
    onOpenChange,
    title = 'Daily Check-in',
    subtitle = 'Come back every day to keep your streak going!',
    days = 7,
    rewards,
    doneIcon = '✓',
    pendingIcon = '🎁',
    buttonLabel = 'Check in',
    checkedInLabel = 'Checked in ✓',
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
        style={{ ['--dcp-days' as string]: days }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Daily check-in'}
      >
        <button className="dcp-close" onClick={() => setOpen(false)} aria-label="Close">
          ×
        </button>
        <h2 className="dcp-title">{title}</h2>
        <p className="dcp-subtitle">{subtitle}</p>
        <div className="dcp-streak">
          <span>🔥</span>
          <span>
            <span className="dcp-streak-count">{streak}</span> day streak
          </span>
        </div>
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
                <span className="dcp-day-icon">{done ? doneIcon : pendingIcon}</span>
                <span className="dcp-day-label">{rewards?.[i] ?? `Day ${i + 1}`}</span>
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
