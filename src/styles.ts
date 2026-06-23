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
  max-width: var(--dcp-max-width, 315px);
  border-radius: var(--dcp-radius, 40px);
  background: var(--dcp-bg, #00a26d);
  color: var(--dcp-text, var(--dcp-secondary, #ffffff));
  // box-shadow: var(--dcp-shadow, 0 20px 50px rgba(0, 0, 0, 0.3));
  padding: 60px 16px 36px;
  text-align: center;
  font-family: var(--dcp-font, 'Inter', system-ui, -apple-system, sans-serif);
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
  width: 88px;
  height: 88px;
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
  display:none !important;
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
  margin: 15px 0 8px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--dcp-text, var(--dcp-secondary, #ffffff));
}
.dcp-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  // margin: 15px 0 5px;
  font-size: 16px;
  // font-weight: 600;
}
.dcp-subtitle .dcp-coin {
  width: 15px;
  height: 15px;
}
.dcp-note {
  // margin: 0 0 24px;
  font-size: 10px;
  font-weight: 500;
  opacity: 0.85;
  // line-height: 1.4;
  margin-bottom:40px;
}
.dcp-days {
  // display: flex;
  // flex-wrap: wrap;
  // justify-content: center;
  // gap: 12px;
  // margin-bottom: 28px;
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  grid-gap: 14px !important;
  margin-top: -20px !important;
  grid-auto-rows: auto !important;
  padding: 0 15px;
}
.dcp-day {
  // position: relative;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  // gap: 8px;
  // padding: 18px 6px 14px;
  // border-radius: 12px;
  // background: var(--dcp-day-bg, rgba(0, 0, 0, 0.15));
  // color: rgba(255, 255, 255, 0.6);
  // flex: 0 1 calc((100% - (var(--dcp-columns, 3) - 1) * 20px) / var(--dcp-columns, 3));
  // box-sizing: border-box;
  // border: 1.5px solid transparent;
  // overflow: hidden;
  // transition: transform 0.2s ease, background-color 0.2s ease;
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  border: 1.5px solid transparent;
  border-radius: 6px !important;
  padding: 12px !important;
  animation: fade-anim .3s linear !important;
  animation-fill-mode: both !important;
  max-height: 118px !important;
  max-width: 78px !important;
  background: var(--dcp-day-bg, rgba(0, 0, 0, 0.15));
  color:#ffffff8a;
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
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 0 0 0 100%;
  background: rgba(255, 255, 255, 0.2);
  color: var(--dcp-secondary, #ffffff);
  font-size: 15px;
  font-weight: 900;
  line-height: 1;
  padding-bottom: 5px;
  padding-left: 5px;
  box-sizing: border-box;
}
.dcp-day-check-img {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 20px;
  height: 20px;
  object-fit: contain;
  pointer-events: none;
}
.dcp-day-name {
  font-size: 10px;
  font-weight: 700;
}
.dcp-day-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  margin:6px 0 10px;
}
.dcp-day-unit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
}
.dcp-day-unit .dcp-coin {
  width: 14px;
  height: 14px;
}
.dcp-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190px;
  height: 40px;
  margin: 8px auto 0;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--dcp-button-bg, var(--dcp-secondary, #ffffff));
  color: var(--dcp-accent, #00a26d);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.5px;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  margin-top: 30px;
}
.dcp-button:not(:disabled) {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.05), 0 0 0 0 rgba(255, 255, 255, 0);
  animation: shadow-pulse 1.5s infinite;
  animation-delay: 0.5s;
  cursor: pointer;
}
.dcp-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 8px 8px rgba(0, 0, 0, 0.08), 0 0 0 0 rgba(255, 255, 255, 0);
}
.dcp-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.05), 0 0 0 0 rgba(255, 255, 255, 0);
}
.dcp-button:disabled {
  // opacity: 0.6;
  box-shadow: none;
  animation: none;
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
.dcp-btn-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
}
.dcp-loading-message svg {
  width: 32px;
  height: 24px;
}
.dcp-loading-circle {
  fill: var(--dcp-accent, #00a26d);
  animation: dcp-dot-pulse 1.2s infinite both;
}
.dcp-loading-circle:nth-child(1) {
  animation-delay: 0s;
}
.dcp-loading-circle:nth-child(2) {
  animation-delay: 0.2s;
}
.dcp-loading-circle:nth-child(3) {
  animation-delay: 0.4s;
}
.dcp-success-message span {
  animation: dcp-fade-in 0.2s ease;
}
@keyframes dcp-dot-pulse {
  0%, 80%, 100% {
    opacity: 0.2;
  }
  40% {
    opacity: 1;
  }
}
@keyframes shadow-pulse {
  0% {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.05), 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.05), 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.05), 0 0 0 0 rgba(255, 255, 255, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dcp-overlay, .dcp-card { animation: none; }
}
.dcp-particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
}
.dcp-particle {
  position: absolute;
  pointer-events: none;
  transition: top 5s linear, left 5s linear, transform 5s linear;
}
/* ── Dark Mode overrides ────────────────────────────────── */
.dcp-card.dcp-dark .dcp-button {
  background: #1c1d22 !important;
  color: #ffffff !important;
}
.dcp-card.dcp-dark .dcp-day-done {
  background: #1c1d22 !important;
  border: 1.5px solid transparent !important;
  color: #ffffff !important;
}
.dcp-card.dcp-dark .dcp-day-today {
  background: #1c1d22 !important;
  border: 1.5px solid transparent !important;
  color: #ffffff !important;
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
