// Styles are injected once at runtime so consumers don't need a CSS import.
// Every color/size reads a --dcp-* CSS variable with a fallback, so any host
// app can re-theme the popup by defining those variables (e.g. per [data-theme]).
export const css = `
.dcp-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--dcp-z-index, 1000);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--dcp-overlay-bg, rgba(0, 0, 0, 0.55));
  backdrop-filter: blur(2px);
  animation: dcp-fade-in 0.2s ease;
}
.dcp-card {
  position: relative;
  width: 100%;
  max-width: var(--dcp-max-width, 400px);
  border-radius: var(--dcp-radius, 16px);
  background: var(--dcp-bg, #ffffff);
  color: var(--dcp-text, #1a1a2e);
  box-shadow: var(--dcp-shadow, 0 20px 60px rgba(0, 0, 0, 0.3));
  padding: 28px 24px 24px;
  font-family: var(--dcp-font, inherit);
  animation: dcp-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dcp-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dcp-muted, #6b7280);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.dcp-close:hover {
  background: var(--dcp-hover, rgba(0, 0, 0, 0.06));
}
.dcp-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}
.dcp-subtitle {
  margin: 0 0 20px;
  font-size: 14px;
  color: var(--dcp-muted, #6b7280);
  text-align: center;
}
.dcp-streak {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 600;
}
.dcp-streak-count {
  color: var(--dcp-accent, #6366f1);
}
.dcp-days {
  display: grid;
  grid-template-columns: repeat(var(--dcp-days, 7), 1fr);
  gap: 8px;
  margin-bottom: 22px;
}
.dcp-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border-radius: 10px;
  background: var(--dcp-day-bg, #f3f4f6);
  border: 1.5px solid transparent;
  font-size: 11px;
  color: var(--dcp-muted, #6b7280);
}
.dcp-day-done {
  background: var(--dcp-day-done-bg, rgba(99, 102, 241, 0.12));
  border-color: var(--dcp-accent, #6366f1);
  color: var(--dcp-accent, #6366f1);
}
.dcp-day-today {
  border-color: var(--dcp-accent, #6366f1);
  border-style: dashed;
}
.dcp-day-icon {
  font-size: 16px;
  line-height: 1;
}
.dcp-day-label {
  font-weight: 600;
  white-space: nowrap;
}
.dcp-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: var(--dcp-accent, #6366f1);
  color: var(--dcp-accent-text, #ffffff);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.1s ease;
}
.dcp-button:hover:not(:disabled) {
  filter: brightness(1.08);
}
.dcp-button:active:not(:disabled) {
  transform: scale(0.98);
}
.dcp-button:disabled {
  cursor: default;
  background: var(--dcp-success, #10b981);
}
@keyframes dcp-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dcp-pop-in {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .dcp-overlay, .dcp-card { animation: none; }
}
`;

let injected = false;

export function injectStyles(): void {
  if (injected || typeof document === 'undefined') return;
  if (document.getElementById('dcp-styles')) {
    injected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = 'dcp-styles';
  style.textContent = css;
  document.head.appendChild(style);
  injected = true;
}
