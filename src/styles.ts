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
  background: var(--dcp-overlay-bg, rgba(0, 0, 0, 0.6));
  backdrop-filter: blur(4px);
  animation: dcp-fade-in 0.2s ease;
}
.dcp-card {
  position: relative;
  width: 100%;
  max-width: var(--dcp-max-width, 330px);
  border-radius: var(--dcp-radius, 28px);
  background: var(--dcp-bg, #00a26d);
  color: var(--dcp-text, var(--dcp-secondary, #ffffff));
  box-shadow: var(--dcp-shadow, 0 20px 50px rgba(0, 0, 0, 0.3));
  padding: 60px 16px 36px;
  text-align: center;
  font-family: var(--dcp-font, system-ui, -apple-system, sans-serif);
  animation: dcp-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* ── Top badge: outer green ring ─────────────────────────── */
.dcp-modal-img-wrap {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--dcp-bg, #00a26d);
  // box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}
/* ── Inner white circle ──────────────────────────────────── */
.dcp-wrap-with-img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--dcp-secondary, #ffffff);
  overflow: hidden;
}
/* ── Coin image inside ───────────────────────────────────── */
.dcp-badge-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
/* ── SVG coin fallback (when no badgeImageUrl) ───────────── */
.dcp-wrap-with-img .dcp-coin {
  width: 44px;
  height: 44px;
}
.dcp-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
  padding: 0;
}
.dcp-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
.dcp-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--dcp-text, var(--dcp-secondary, #ffffff));
}
.dcp-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
}
.dcp-subtitle .dcp-coin {
  width: 20px;
  height: 20px;
}
.dcp-note {
  margin: 0 0 24px;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.85;
  line-height: 1.4;
}
.dcp-days {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}
.dcp-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 6px 14px;
  border-radius: 12px;
  background: var(--dcp-day-bg, rgba(0, 0, 0, 0.15));
  color: rgba(255, 255, 255, 0.6);
  flex: 0 1 calc((100% - (var(--dcp-columns, 3) - 1) * 20px) / var(--dcp-columns, 3));
  box-sizing: border-box;
  border: 1.5px solid transparent;
  overflow: hidden;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.dcp-day-done {
  background: var(--dcp-day-done-bg, rgba(0, 0, 0, 0.08));
  border: 1.5px solid var(--dcp-secondary, #ffffff);
  color: var(--dcp-text, var(--dcp-secondary, #ffffff));
}
.dcp-day-today {
  background: var(--dcp-day-active-bg, var(--dcp-secondary, #ffffff));
  border: 1.5px solid var(--dcp-secondary, #ffffff);
  color: var(--dcp-accent, #00a26d);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.dcp-day-check {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dcp-secondary, #ffffff);
  color: var(--dcp-accent, #00a26d);
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}
.dcp-day-name {
  font-size: 11px;
  font-weight: 600;
}
.dcp-day-value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}
.dcp-day-unit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}
.dcp-day-unit .dcp-coin {
  width: 14px;
  height: 14px;
}
.dcp-button {
  display: block;
  width: 80%;
  margin: 8px auto 0;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: var(--dcp-button-bg, var(--dcp-secondary, #ffffff));
  color: var(--dcp-accent, #00a26d);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.dcp-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}
.dcp-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.dcp-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
