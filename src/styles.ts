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
  padding: 72px 16px 16px;
  background: var(--dcp-overlay-bg, rgba(0, 0, 0, 0.65));
  backdrop-filter: blur(2px);
  animation: dcp-fade-in 0.2s ease;
}
.dcp-card {
  position: relative;
  width: 100%;
  max-width: var(--dcp-max-width, 420px);
  border-radius: var(--dcp-radius, 36px);
  background: var(--dcp-bg, #57a773);
  color: var(--dcp-text, #ffffff);
  box-shadow: var(--dcp-shadow, 0 20px 60px rgba(0, 0, 0, 0.35));
  padding: 72px 28px 32px;
  text-align: center;
  font-family: var(--dcp-font, inherit);
  animation: dcp-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dcp-badge {
  position: absolute;
  top: -52px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: var(--dcp-bg, #57a773);
}
.dcp-badge .dcp-coin {
  width: 60px;
  height: 60px;
}
.dcp-close {
  position: absolute;
  top: 14px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dcp-text, #ffffff);
  opacity: 0.8;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.dcp-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
}
.dcp-title {
  margin: 0 0 10px;
  font-size: 32px;
  font-weight: 800;
}
.dcp-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
}
.dcp-subtitle .dcp-coin {
  width: 22px;
  height: 22px;
}
.dcp-note {
  margin: 0 0 24px;
  font-size: 13px;
  opacity: 0.95;
}
.dcp-days {
  display: grid;
  grid-template-columns: repeat(var(--dcp-columns, 3), 1fr);
  gap: 14px;
  margin-bottom: 28px;
}
.dcp-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 6px 14px;
  border-radius: 14px;
  background: var(--dcp-day-bg, rgba(0, 0, 0, 0.14));
  color: var(--dcp-text, #ffffff);
  overflow: hidden;
}
.dcp-day-done,
.dcp-day-today {
  background: var(--dcp-day-active-bg, #ffffff);
  color: var(--dcp-accent, #3e8e57);
}
.dcp-day-check {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 0 14px 0 12px;
  background: var(--dcp-bg, #57a773);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}
.dcp-day-name {
  font-size: 13px;
  font-weight: 700;
}
.dcp-day-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}
.dcp-day-unit {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
}
.dcp-day-unit .dcp-coin {
  width: 16px;
  height: 16px;
}
.dcp-button {
  display: block;
  width: 78%;
  margin: 0 auto;
  padding: 16px;
  border: none;
  border-radius: 999px;
  background: var(--dcp-button-bg, #ffffff);
  color: var(--dcp-accent, #3e8e57);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 0 0 6px var(--dcp-button-ring, rgba(255, 255, 255, 0.3));
  transition: filter 0.15s ease, transform 0.1s ease;
}
.dcp-button:hover:not(:disabled) {
  filter: brightness(0.96);
}
.dcp-button:active:not(:disabled) {
  transform: scale(0.98);
}
.dcp-button:disabled {
  cursor: default;
  opacity: 0.75;
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
